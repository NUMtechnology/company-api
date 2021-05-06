import { expect } from 'chai';
import { buildNumUri, NumClient, NumUri, PositiveInteger } from 'num-client';
import { CallbackHandler } from 'num-client/dist/client';
import { Context, NumLocation, UserVariable } from 'num-client/dist/context';
import { ModuleDnsQueries } from 'num-client/dist/modulednsqueries';
import { ResourceLoader } from 'num-client/dist/resourceloader';
import { createModuleDnsQueries } from '../../num-javascript-client/src/modulednsqueries';
import { createCompanyApi } from '../src/CompanyApi';

describe('Company API', () => {
  it('Can lookup a NUM URI using a CompanyApi instance', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy.com'));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"organisation":{"object_display_name":"Organisation","name":"dummy.com","slogan":null,"contacts":[{"link":{"@L":"sub-page-1","description":"John","person":{"object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"telephone":{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"core","value":"123123","hours":null}}],"images":[{"name":null,"type":"headshot","variants":[{"url":"1088937600.jpg","mime":"image/jpg","width":1000,"height":1000}]}]}}},{"link":{"@L":"sub-page-2","description":"Jane","person":{"object_display_name":"Person","name":"Jane Doe","bio":null,"contacts":[{"telephone":{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"core","value":"456456456","hours":null}}]}}}],"images":[{"name":null,"type":"logo","variants":[{"url":"LX67y17q.jpg","mime":"image/jpg","width":1000,"height":1000}]}]}}'
    );
  });

  it('Can lookup a NUM URI using a CompanyApi instance for a record with cycles', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy-cyclic.com'));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"organisation":{"object_display_name":"Organisation","name":"dummy-cyclic.com","slogan":null,"contacts":[{"link":{"@L":"sub-page-1","description":"John","person":{"object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"link":{"@L":"/","description":"John"}}]}}}]}}'
    );
  });
});

class DummyNumClient implements NumClient {
  loader: ResourceLoader | null;
  env: string;

  constructor() {
    this.loader = null;
    this.env = 'test';
  }

  createContext(numAddress: NumUri): Context {
    return new DummyContext(numAddress);
  }
  retrieveNumRecord(ctx: Context, handler?: CallbackHandler): Promise<string | null> {
    let r: string | null = null;

    if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"organisation":{"object_display_name":"Organisation","name":"dummy.com","slogan":null,"contacts":[{"link":{"@L":"sub-page-1","description":"John"}},{"link":{"@L":"sub-page-2","description":"Jane"}}]}}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 3) {
      r = '{"@n":1,"images":[{"name":null,"type":"logo","variants":[{"url":"LX67y17q.jpg","mime":"image/jpg","width":1000,"height":1000}]}]}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"person":{"object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"telephone":{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"core","value":"123123","hours":null}}]}}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 3) {
      r = '{"@n":1,"images":[{"name":null,"type":"headshot","variants":[{"url":"1088937600.jpg","mime":"image/jpg","width":1000,"height":1000}]}]}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/sub-page-2' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"person":{"object_display_name":"Person","name":"Jane Doe","bio":null,"contacts":[{"telephone":{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"core","value":"456456456","hours":null}}]}}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/sub-page-2' && ctx.numAddress.port.n === 3) {
      r = null;
    } else if (ctx.numAddress.host.s === 'dummy-cyclic.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"organisation":{"object_display_name":"Organisation","name":"dummy-cyclic.com","slogan":null,"contacts":[{"link":{"@L":"sub-page-1","description":"John"}}]}}';
    } else if (ctx.numAddress.host.s === 'dummy-cyclic.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 3) {
      r = null;
    } else if (ctx.numAddress.host.s === 'dummy-cyclic.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 1) {
      r = '{"@n":1,"person":{"object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"link":{"@L":"/","description":"John"}}]}}';
    } else if (ctx.numAddress.host.s === 'dummy-cyclic.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 3) {
      r = null;
    } else {
      console.log(`UNKNOWN numAddress = ${ctx.numAddress}`);
    }
    ctx.result = r;
    if (handler && r) {
      handler.setResult(r);
    }
    return Promise.resolve(ctx.result);
  }
  retrieveModlRecord(ctx: Context, handler?: CallbackHandler): Promise<string> {
    ctx.result = '';
    if (handler) {
      handler.setResult('');
    }
    return Promise.resolve(ctx.result);
  }
  setResourceLoader(loader: ResourceLoader): void {
    this.loader = loader;
  }
  interpret(modl: string, moduleNumber: PositiveInteger, userVariables: Map<string, UserVariable>): Promise<string> {
    return Promise.resolve(`${modl}, ${moduleNumber}, ${userVariables}`);
  }
  setenv(env: string): void {
    this.env = env;
  }
}

class DummyContext implements Context {
  public location = NumLocation.independent;
  public result: string | null = null;
  public readonly numAddress: NumUri;
  _queries: ModuleDnsQueries;
  redirectCount = 0;
  userVariables: Map<string, UserVariable>;
  /**
   * Dnssec is checked if this is `true` - NOT YET IMPLEMENTED
   */
  dnssec = false;

  /**
   * Creates an instance of context.
   *
   * @param numAddress
   */
  constructor(numAddress: NumUri) {
    this.numAddress = numAddress;
    this._queries = createModuleDnsQueries(numAddress.port, numAddress);
    this.userVariables = new Map<string, UserVariable>();
  }

  /**
   * Sets user variable
   *
   * @param name
   * @param value
   */
  setUserVariable(name: string, value: UserVariable): void {
    this.userVariables.set(name, value);
  }

  /**
   * Count redirects and return the current number of redirects.
   *
   * @return the current number of redirects
   */
  incrementRedirectCount(): number {
    return ++this.redirectCount;
  }

  /**
   * Gets queries
   */
  get queries(): ModuleDnsQueries {
    return this._queries;
  }

  /**
   * Update the relevant query for the supplied redirect
   *
   * @param redirect the supplied redirect
   * @throws NumMaximumRedirectsExceededException on Error
   * @throws NumInvalidDNSQueryException          on Error
   * @throws NumInvalidRedirectException          on Error
   */
  handleQueryRedirect(redirect: string): void {
    console.log('QUERY REDIRECT: ' + redirect);
  }

  /**
   * Update the hosted query for the supplied redirect
   *
   * @param redirectTo the supplied redirect
   * @throws NumInvalidDNSQueryException on error
   * @throws NumInvalidRedirectException on error
   */
  handleHostedQueryRedirect(redirectTo: string): void {
    console.log('HOSTED QUERY REDIRECT: ' + redirectTo);
  }

  /**
   * Update the independent query for the supplied redirect
   *
   * @param redirectTo the supplied redirect
   * @throws NumInvalidDNSQueryException on error
   * @throws NumInvalidRedirectException on error
   */
  handleIndependentQueryRedirect(redirectTo: string): void {
    console.log('INDEPENDENT QUERY REDIRECT: ' + redirectTo);
  }
}
