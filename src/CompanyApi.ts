/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  buildNumUri,
  createClient,
  createDefaultCallbackHandler,
  DefaultCallbackHandler,
  MODULE_1,
  MODULE_3,
  NumClient,
  NumUri,
  parseNumUri,
  UrlPath,
} from 'num-client';
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
  public contactsDepth = Number.MAX_SAFE_INTEGER;
  public imagesDepth = Number.MAX_SAFE_INTEGER;
  public moduleVersionMap: Map<number, string> = new Map();
  public language = 'en';
  public country = 'us';
  /**
   *
   * @param contactsDepth how deep to recurse into sub-records - 1 to 5 is probably good enough.
   * @param imagesDepth how deep to recurse into sub-records - 1 to 5 is probably good enough.
   * @param moduleVersionMap a Map<number, string> linking module numbers to the associated module version, e.g. `map.set(1,'2')` for contacts. This can be an empty map if you want contacts version 2 and version 1 for everything else, otherwise populate the map with the non-default entries you need.
   */
  constructor(init?: Partial<CompanyApiOptions>) {
    Object.assign(this, init);

    if (!Number.isInteger(this.contactsDepth) || this.contactsDepth < 0) {
      this.contactsDepth = 0;
    }
    if (!Number.isInteger(this.imagesDepth) || this.imagesDepth < 0) {
      this.imagesDepth = 0;
    }

    if (this.moduleVersionMap.size === 0) {
      this.moduleVersionMap = new Map<number, string>();
      this.moduleVersionMap.set(1, '2');
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
type PromiseAndHandler = { promise: Promise<string | null>; handler: DefaultCallbackHandler };
type UriToPromiseMap = Map<string, PromiseAndHandler>;

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
    const theOptions = new CompanyApiOptions(options);

    const lookup = new Lookup({}, uri.withPort(MODULE_1), uri.withPort(MODULE_3));
    const uriMap = new Map<string, PromiseAndHandler>();
    return retrieveRecord(this.client, lookup, uriMap, theOptions).then((result): Record<string, unknown> => {
      const response = result['numObject'] ? (result['numObject'] as Record<string, unknown>) : result;
      return collectErrorMetadata(response, uriMap);
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
 * Gather any error codes to an overall metadata object.
 *
 * @param data the company data with nested metadata
 * @param uriMap a map of URIs to promises and handlers
 * @returns the data with an additional error code summary
 */
const collectErrorMetadata = (data: Record<string, unknown>, uriMap: Map<string, PromiseAndHandler>): Record<string, unknown> => {
  const metadata: { errors: Array<any> } = {
    errors: [],
  };

  for (const [uri, promiseAndHandler] of uriMap) {
    if (promiseAndHandler.handler && promiseAndHandler.handler.getErrorCode() != null) {
      const err = { uri: uri, error: promiseAndHandler.handler.getErrorCode(), moduleNumber: parseNumUri(uri).port.n };
      metadata.errors.push(err);
    }
  }

  data['metadata'] = metadata;

  return data;
};

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
  const options = new CompanyApiOptions(optionsParam);
  options.contactsDepth = options.contactsDepth - 1;
  options.imagesDepth = options.imagesDepth - 1;
  //
  // Start a contacts record lookup if there isn't already one outstanding.
  const contactsUriString = lookup.contactsUri.toString();

  if (!usedUris.has(contactsUriString)) {
    const handler = createDefaultCallbackHandler() as DefaultCallbackHandler;
    const contactsContext = client.createContext(lookup.contactsUri);
    contactsContext.setUserVariable('_L', optionsParam.language ? optionsParam.language : 'en');
    contactsContext.setUserVariable('_C', optionsParam.country ? optionsParam.country : 'us');

    const contactsModuleTargetVersion = options.moduleVersionMap.get(1);
    contactsContext.setTargetExpandedSchemaVersion(contactsModuleTargetVersion ? contactsModuleTargetVersion : '2');
    const contactsPromise = client.retrieveNumRecord(contactsContext, handler);
    usedUris.set(contactsUriString, { promise: contactsPromise, handler: handler });

    let imagesPromise;
    // Start an images record lookup if there isn't already one outstanding.
    const imagesUriString = lookup.imagesUri.toString();
    if (!usedUris.has(imagesUriString) && optionsParam.imagesDepth > 0) {
      const imagesHandler = createDefaultCallbackHandler() as DefaultCallbackHandler;
      const imagesModuleContext = client.createContext(lookup.imagesUri);
      imagesModuleContext.setUserVariable('_L', optionsParam.language ? optionsParam.language : 'en');
      imagesModuleContext.setUserVariable('_C', optionsParam.country ? optionsParam.country : 'us');

      const imagesModuleTargetVersion = options.moduleVersionMap.get(3);
      imagesModuleContext.setTargetExpandedSchemaVersion(imagesModuleTargetVersion ? imagesModuleTargetVersion : '1');
      imagesPromise = client.retrieveNumRecord(imagesModuleContext, imagesHandler);
      usedUris.set(imagesUriString, { promise: imagesPromise, handler: imagesHandler });
    }

    // When the contacts and images records are available...
    return contactsPromise.then((contacts) => {
      const contactsObject: Record<string, unknown> =
        contacts !== null ? ContactsModuleHelper.transform(JSON.parse(contacts), { _C: optionsParam.country, _L: optionsParam.language }, null) : {};
      delete contactsObject['numVersion'];

      // There might be two keys left after deleting the `@n` key...
      for (const k in contactsObject) {
        if (k !== 'populated' && k !== '@version') {
          // Grab the body of the NUM record
          if (handler.getErrorCode() != null) {
            const co = contactsObject as Record<string, Record<string, unknown>>;
            co[k]['metadata'] = { status: handler.getErrorCode() };
          }

          lookup.link[k] = contactsObject[k];
          if (contactsObject['populated']) {
            // Copy the `populated` value if there is one.
            const o = contactsObject[k] as Record<string, unknown>;
            o['populated'] = contactsObject['populated'];
          }
          break; // This _should_ be the right one
        }
      }

      // Follow any `link` records
      const subRecordsPromise = followLinks(client, usedUris, contactsObject, lookup.contactsUri, options);

      // Handle the images promise second since we need to include the images in the contacts object.
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
    const contactsUriPromise = usedUris.get(contactsUriString) as PromiseAndHandler;
    return contactsUriPromise.promise.then((contacts) => {
      const contactsObject: Record<string, unknown> =
        contacts !== null ? ContactsModuleHelper.transform(JSON.parse(contacts), { _C: optionsParam.country, _L: optionsParam.language }, null) : {};
      delete contactsObject['numVersion'];
      delete contactsObject['populated'];

      // There should only be one key left after deleting the `@n` key...
      for (const k in contactsObject) {
        if (contactsUriPromise.handler.getErrorCode() != null) {
          const co = contactsObject as Record<string, Record<string, unknown>>;
          co[k]['metadata'] = { status: contactsUriPromise.handler.getErrorCode() };
        }

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
