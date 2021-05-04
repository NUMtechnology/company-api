/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { buildNumUri, createClient, MODULE_1, MODULE_3, NumClient, NumUri, UrlPath } from 'num-client';
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
   * @return a Promise for a Record<string, unknown>
   */
  lookupUri(uri: NumUri): Promise<Record<string, unknown>>;
  lookupDomain(domain: string): Promise<Record<string, unknown>>;
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

type UriToPromiseMap = Map<NumUri, Promise<string | null>>;

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
   * with the links replaced by the records the refer to.
   *
   * @param uri a NumUri to retrieve
   * @return a Promise for a Record<string, unknown>
   */
  lookupUri(uri: NumUri): Promise<Record<string, unknown>> {
    const lookup = new Lookup({}, uri.withPort(MODULE_1), uri.withPort(MODULE_3));
    return retrieveRecord(this.client, lookup, new Map<NumUri, Promise<string | null>>());
  }

  lookupDomain(domain: string): Promise<Record<string, unknown>> {
    return this.lookupUri(buildNumUri(domain));
  }
}

/**
 *
 * @param client the NumClient to use for lookups
 * @param uri the uri to lookup
 * @param usedUris an Array of NumUri's that have already been looked up - prevents infinite recursion
 * @returns a Promise of a Record<string, unknown>
 */
const retrieveRecord = (client: NumClient, lookup: Lookup, usedUris: UriToPromiseMap): Promise<Record<string, unknown>> => {
  let contactsPromise: Promise<string | null>;
  let imagesPromise: Promise<string | null>;

  // Start a contacts record lookup if there isn't already one outstanding.
  if (usedUris.has(lookup.contactsUri)) {
    contactsPromise = usedUris.get(lookup.contactsUri)!;
  } else {
    contactsPromise = client.retrieveNumRecord(client.createContext(lookup.contactsUri));
    usedUris.set(lookup.contactsUri, contactsPromise);
  }

  // Start an images record lookup if there isn't already one outstanding.
  if (usedUris.has(lookup.imagesUri)) {
    imagesPromise = usedUris.get(lookup.imagesUri)!;
  } else {
    imagesPromise = client.retrieveNumRecord(client.createContext(lookup.imagesUri));
    usedUris.set(lookup.contactsUri, imagesPromise);
  }

  // When the contacts and images records are available...
  return contactsPromise.then((contacts) => {
    const contactsObject: Record<string, unknown> = contacts !== null ? JSON.parse(contacts) : {};
    delete contactsObject['@n'];
    if (contactsObject.organisation) {
      lookup.link.organisation = contactsObject.organisation;
    } else if (contactsObject.person) {
      lookup.link.person = contactsObject.person;
    } else if (contactsObject.department) {
      lookup.link.department = contactsObject.department;
    } else if (contactsObject.group) {
      lookup.link.group = contactsObject.group;
    } else if (contactsObject.location) {
      lookup.link.location = contactsObject.location;
    }

    imagesPromise.then((images) => {
      if (images !== null) {
        const imagesObj = JSON.parse(images).images;
        if (contactsObject.organisation) {
          const org = contactsObject.organisation as Record<string, unknown>;
          org.images = imagesObj;
        } else if (contactsObject.person) {
          const person = contactsObject.person as Record<string, unknown>;
          person.images = imagesObj;
        } else if (contactsObject.department) {
          const dept = contactsObject.department as Record<string, unknown>;
          dept.images = imagesObj;
        } else if (contactsObject.group) {
          const group = contactsObject.group as Record<string, unknown>;
          group.images = imagesObj;
        } else if (contactsObject.location) {
          const location = contactsObject.location as Record<string, unknown>;
          location.images = imagesObj;
        } else {
          contactsObject.images = imagesObj;
        }
      }
    });
    return followLinks(client, usedUris, contactsObject, lookup.contactsUri);
  }, handleError);
};

const followLinks = (client: NumClient, usedUris: UriToPromiseMap, jsonObj: Record<string, unknown>, currentUri: NumUri): Promise<Record<string, unknown>> => {
  const promises = findLinks(jsonObj, currentUri).map((l) => {
    const lookup = new Lookup(l.link, l.uri.withPort(MODULE_1), l.uri.withPort(MODULE_3));
    return retrieveRecord(client, lookup, usedUris);
  });
  return Promise.all(promises).then(() => {
    return jsonObj;
  }, handleError);
};

const handleError = (reason: string): Promise<Record<string, unknown>> => {
  throw new Error(reason);
};

const findLinks = (obj: Record<string, unknown>, uri: NumUri): Array<Link> => {
  const links = new Array<Link>();
  for (const k in obj) {
    if (k === 'link') {
      const link = obj[k] as Record<string, unknown>;
      const path = link['@L'] as string;
      const newUrlPath = new UrlPath(uri.path.s + path);
      links.push(new Link(link, uri.withPath(newUrlPath)));
    } else {
      const value = obj[k];
      if (typeof value === 'object') {
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

class Link {
  constructor(readonly link: Record<string, unknown>, readonly uri: NumUri) {}
}
