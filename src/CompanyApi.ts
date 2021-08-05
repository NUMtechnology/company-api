/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { buildNumUri, createClient, MODULE_1, MODULE_3, NumClient, NumUri, parseNumUri, UrlPath } from 'num-client';
import ContactsModuleHelper from './Contacts';
//------------------------------------------------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------------------------------------------------
/**
 * The CompanyApi interface
 */
export interface CompanyApi {
  /**
   * Retrieve the MODL record for a NUM URI, lookup any links it contains (recursively) and produce a single JSON result
   * with the links replaced by the records the refer to.
   *
   * @param uri a NumUri to retrieve
   * @param options an optional CompanyApiOptions object
   * @return a Promise for a Record<string, unknown>
   */
  lookupUri(uri: NumUri, options?: CompanyApiOptions): Promise<Record<string, unknown>>;
  lookupDomain(domain: string, options?: CompanyApiOptions): Promise<Record<string, unknown>>;
}

/**
 * Options for use with the CompanyApi
 */
export class CompanyApiOptions {
  constructor(readonly contactsDepth: number, readonly imagesDepth: number) {
    if (!Number.isInteger(this.contactsDepth) || this.contactsDepth < 0) {
      this.contactsDepth = 0;
    }
    if (!Number.isInteger(this.imagesDepth) || this.imagesDepth < 0) {
      this.imagesDepth = 0;
    }
  }
}

/**
 * Create a CompanyApi implementation instance
 * @param numClient an optional NumClient to use for the lookup
 * @returns a CompanyApi implementation
 */
export const createCompanyApi = (numClient?: NumClient): CompanyApi => new CompanyApiImpl(numClient);

//------------------------------------------------------------------------------------------------------------------------
// Internals
//------------------------------------------------------------------------------------------------------------------------

type UriToPromiseMap = Map<string, Promise<string | null>>;

/**
 * The CompanyApi implementation
 */
class CompanyApiImpl implements CompanyApi {
  private client: NumClient;

  /**
   * Constructor
   * @param numClient an optional NumClient to use for the lookup
   */
  constructor(numClient?: NumClient) {
    this.client = numClient ? numClient : createClient();
  }

  /**
   * Retrieve the MODL record for a NUM URI, lookup any links it contains (recursively) and produce a single JSON result
   * with the links replaced by the records they refer to.
   *
   * @param uri a NumUri to retrieve
   * @param options a CompanyApiOptions object
   * @returns a Promise for a Record<string, unknown>
   */
  lookupUri(uri: NumUri, options?: CompanyApiOptions): Promise<Record<string, unknown>> {
    // We're going to modify the options to control recursion depths, so make a copy or set large default values.
    const theOptions = options
      ? new CompanyApiOptions(options.contactsDepth, options.imagesDepth)
      : new CompanyApiOptions(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

    const lookup = new Lookup({}, uri.withPort(MODULE_1), uri.withPort(MODULE_3));
    return retrieveRecord(this.client, lookup, new Map<string, Promise<string | null>>(), theOptions).then((result): Record<string, unknown> => {
      return result['numObject'] ? (result['numObject'] as Record<string, unknown>) : result;
    });
  }

  /**
   * Lookup a domain name string.
   *
   * @param domain A domain name string
   * @param options a CompanyApiOptions object
   * @return a Promise for a Record<string, unknown>
   */
  lookupDomain(domain: string, options?: CompanyApiOptions): Promise<Record<string, unknown>> {
    return this.lookupUri(buildNumUri(domain), options);
  }
}

/**
 * Retrieve linked NUM records recursively
 *
 * @param client the NumClient to use for lookups
 * @param lookup a Lookup object
 * @param usedUris a Map of NumUri's that have already been looked up - prevents infinite recursion
 * @param options a CompanyApiOptions object
 * @returns a Promise of a Record<string, unknown>
 */
const retrieveRecord = (client: NumClient, lookup: Lookup, usedUris: UriToPromiseMap, optionsParam: CompanyApiOptions): Promise<Record<string, unknown>> => {
  if (optionsParam.contactsDepth <= 0) {
    return Promise.resolve({});
  }
  const options = new CompanyApiOptions(optionsParam.contactsDepth - 1, optionsParam.imagesDepth - 1);
  // Start a contacts record lookup if there isn't already one outstanding.
  const contactsUriString = JSON.stringify(lookup.contactsUri);

  if (!usedUris.has(contactsUriString)) {
    const contactsPromise = client.retrieveNumRecord(client.createContext(lookup.contactsUri));
    usedUris.set(contactsUriString, contactsPromise);

    let imagesPromise;
    // Start an images record lookup if there isn't already one outstanding.
    const imagesUriString = JSON.stringify(lookup.imagesUri);
    if (!usedUris.has(imagesUriString) && optionsParam.imagesDepth > 0) {
      imagesPromise = client.retrieveNumRecord(client.createContext(lookup.imagesUri));
      usedUris.set(imagesUriString, imagesPromise);
    }

    // When the contacts and images records are available...
    return contactsPromise.then((contacts) => {
      const contactsObject: Record<string, unknown> =
        contacts !== null ? ContactsModuleHelper.transform(JSON.parse(contacts), { _C: 'gb', _L: 'en' }, null) : {};
      delete contactsObject['numVersion'];
      delete contactsObject['populated'];

      // There should only be one key left after deleting the `@n` key...
      for (const k in contactsObject) {
        lookup.link[k] = contactsObject[k];
        break; // The first item _should_ be the right one
      }

      // Follow any `link` records
      const subRecordsPromise = followLinks(client, usedUris, contactsObject, lookup.contactsUri, options);

      // Handle the imags promise second since we need to include the images in the contacts object.
      if (imagesPromise) {
        return imagesPromise.then((images) => {
          if (images !== null) {
            const imagesObject = JSON.parse(images).images;

            if (contactsObject['numObject']) {
              (contactsObject['numObject'] as Record<string, unknown>).images = imagesObject;
            }
          }
          return Promise.all([imagesPromise, subRecordsPromise]).then(() => {
            return subRecordsPromise;
          }, handleError);
        }, handleError);
      }
      return subRecordsPromise;
    }, handleError);
  } else {
    // We have an existing outstanding promise so resolve it.
    const contactsUriPromise = usedUris.get(contactsUriString) as Promise<string | null>;
    return contactsUriPromise.then((contacts) => {
      const contactsObject: Record<string, unknown> =
        contacts !== null ? ContactsModuleHelper.transform(JSON.parse(contacts), { _C: 'gb', _L: 'en' }, null) : {};
      delete contactsObject['numVersion'];
      delete contactsObject['populated'];

      // There should only be one key left after deleting the `@n` key...
      for (const k in contactsObject) {
        lookup.link[k] = contactsObject[k];
        break; // The first item _should_ be the right one
      }

      return contactsObject;
    }, handleError);
  }
};

/**
 * Find any `link` records in the given jsonObj and resolve them recursively
 *
 * @param client the NumClient to use
 * @param usedUris a Map of NumUri's we have already looked up in higher level calls.
 * @param jsonObj the result of the higher level NUM lookup - it might contain `link`s
 * @param currentUri the uri of the higher level NUM lookup - we need it as a base for links
 * @returns a Promise of a Record<string, unknown>
 */
const followLinks = (
  client: NumClient,
  usedUris: UriToPromiseMap,
  jsonObj: Record<string, unknown>,
  currentUri: NumUri,
  optionsParam: CompanyApiOptions
): Promise<Record<string, unknown>> => {
  const promises = findLinks(jsonObj, currentUri).map((l) => {
    const lookup = new Lookup(l.link, l.uri.withPort(MODULE_1), l.uri.withPort(MODULE_3));
    return retrieveRecord(client, lookup, usedUris, optionsParam);
  });
  return Promise.all(promises).then(() => {
    return jsonObj;
  }, handleError);
};

/**
 * A general error handler.
 *
 * @param reason a description of the error
 */
const handleError = (reason: string): Promise<Record<string, unknown>> => {
  throw new Error(reason);
};

/**
 *
 * @param obj Search an object recursively for links
 * @param uri the URI of the current record.
 * @returns an Array of Link objects.
 */
const findLinks = (obj: Record<string, unknown>, uri: NumUri): Array<Link> => {
  const links = new Array<Link>();
  for (const k in obj) {
    if (k === 'method_type' && obj[k] === 'link' && obj['@L']) {
      const link = obj;
      const path = link['@L'] as string;
      const newUri = path.startsWith('num://')
        ? parseNumUri(path)
        : path.startsWith('/')
        ? uri.withPath(new UrlPath(path))
        : uri.path.s.endsWith('/')
        ? uri.withPath(new UrlPath(uri.path.s + path))
        : uri.withPath(new UrlPath(uri.path.s + '/' + path));
      links.push(new Link(link, newUri));
    } else {
      const value = obj[k];
      if (value !== null && typeof value === 'object') {
        findLinks(value as Record<string, unknown>, uri).forEach((l) => links.push(l));
      }
    }
  }
  return links;
};

/**
 * Hold information about a NUM lookup whose result needs to be added to the `target` object.
 */
class Lookup {
  constructor(readonly link: Record<string, unknown>, readonly contactsUri: NumUri, readonly imagesUri: NumUri) {}
}

/**
 * Hold information about a link that we need to look up.
 */
class Link {
  constructor(readonly link: Record<string, unknown>, readonly uri: NumUri) {}
}
