import { expect } from 'chai';
import { buildNumUri, NumClient, NumUri, PositiveInteger } from 'num-client';
import { CallbackHandler } from 'num-client/dist/client';
import { Context, NumLocation, UserVariable } from 'num-client/dist/context';
import { createModuleDnsQueries, ModuleDnsQueries } from 'num-client/dist/modulednsqueries';
import { ResourceLoader } from 'num-client/dist/resourceloader';
import { CompanyApiOptions, createCompanyApi } from '../src/CompanyApi';
import pino from 'pino';

const log = pino();

describe('Company API', () => {
  it('Can lookup a NUM URI using a CompanyApi instance', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy.com'));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"object_display_name":"Organisation","object_type":"organization","name":"dummy.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"person","object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"method_type":"telephone","object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","value":{"original":"123123","error":"Sms telephone number not in valid international format","display":"123123","dial":"123123"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"123123","error":"Sms telephone number not in valid international format","display":"123123","dial":"123123"}}]}},"images":[{"name":null,"type":"headshot","variants":[{"url":"1088937600.jpg","mime":"image/jpg","width":1000,"height":1000}]}]}},{"method_type":"link","@L":"sub-page-2","description":"Jane","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"person","object_display_name":"Person","name":"Jane Doe","bio":null,"contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"}}]}}}}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"sub-page-1"},{"description":"Jane","@L":"sub-page-2"}]}},"populated":1,"images":[{"name":null,"type":"logo","variants":[{"url":"LX67y17q.jpg","mime":"image/jpg","width":1000,"height":1000}]}],"metadata":{"errors":[]}}'
    );
  });

  it('Can lookup a NUM URI using a CompanyApi instance with contacts depth 0 and images depth 0', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy.com'), new CompanyApiOptions(0, 0, new Map()));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal('{"metadata":{"errors":[]}}');
  });

  it('Can lookup a NUM URI using a CompanyApi instance with contacts depth 1 and images depth 0', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy.com'), new CompanyApiOptions(1, 0, new Map()));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"object_display_name":"Organisation","object_type":"organization","name":"dummy.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png"},{"method_type":"link","@L":"sub-page-2","description":"Jane","icon":"https://100px.logos.uk/link.media.num.uk.png"}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"sub-page-1"},{"description":"Jane","@L":"sub-page-2"}]}},"populated":1,"metadata":{"errors":[]}}'
    );
  });

  it('Can lookup a NUM URI using a CompanyApi instance with contacts depth 1 and images depth 1', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy.com'), new CompanyApiOptions(1, 1, new Map()));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"object_display_name":"Organisation","object_type":"organization","name":"dummy.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png"},{"method_type":"link","@L":"sub-page-2","description":"Jane","icon":"https://100px.logos.uk/link.media.num.uk.png"}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"sub-page-1"},{"description":"Jane","@L":"sub-page-2"}]}},"populated":1,"images":[{"name":null,"type":"logo","variants":[{"url":"LX67y17q.jpg","mime":"image/jpg","width":1000,"height":1000}]}],"metadata":{"errors":[]}}'
    );
  });

  it('Can lookup a NUM URI using a CompanyApi instance with contacts depth 2 and images depth 1', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy.com'), new CompanyApiOptions(2, 1, new Map()));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"object_display_name":"Organisation","object_type":"organization","name":"dummy.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"person","object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"method_type":"telephone","object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","value":{"original":"123123","error":"Sms telephone number not in valid international format","display":"123123","dial":"123123"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"123123","error":"Sms telephone number not in valid international format","display":"123123","dial":"123123"}}]}}}},{"method_type":"link","@L":"sub-page-2","description":"Jane","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"person","object_display_name":"Person","name":"Jane Doe","bio":null,"contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"}}]}}}}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"sub-page-1"},{"description":"Jane","@L":"sub-page-2"}]}},"populated":1,"images":[{"name":null,"type":"logo","variants":[{"url":"LX67y17q.jpg","mime":"image/jpg","width":1000,"height":1000}]}],"metadata":{"errors":[]}}'
    );
  });

  it('Can lookup a NUM URI using a CompanyApi instance with contacts depth 2 and images depth 2', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy.com'), new CompanyApiOptions(2, 2, new Map()));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"object_display_name":"Organisation","object_type":"organization","name":"dummy.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"person","object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"method_type":"telephone","object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","value":{"original":"123123","error":"Sms telephone number not in valid international format","display":"123123","dial":"123123"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"123123","error":"Sms telephone number not in valid international format","display":"123123","dial":"123123"}}]}},"images":[{"name":null,"type":"headshot","variants":[{"url":"1088937600.jpg","mime":"image/jpg","width":1000,"height":1000}]}]}},{"method_type":"link","@L":"sub-page-2","description":"Jane","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"person","object_display_name":"Person","name":"Jane Doe","bio":null,"contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"}}]}}}}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"sub-page-1"},{"description":"Jane","@L":"sub-page-2"}]}},"populated":1,"images":[{"name":null,"type":"logo","variants":[{"url":"LX67y17q.jpg","mime":"image/jpg","width":1000,"height":1000}]}],"metadata":{"errors":[]}}'
    );
  });

  it('Can lookup a NUM URI using a CompanyApi instance for a record with cycles', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy-cyclic.com'));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"object_type":"organization","object_display_name":"Organisation","name":"dummy-cyclic.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"person","object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"method_type":"link","@L":"/","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"organization","object_display_name":"Organisation","name":"dummy-cyclic.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png"}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"sub-page-1"}]}}}}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"/"}]}}}}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"sub-page-1"}]}},"metadata":{"errors":[]}}'
    );
  });

  it('Can lookup a NUM URI using a CompanyApi instance for a record with absolute NUM URIs as links', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('dummy-absolute.com'));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"object_type":"organization","object_display_name":"Organisation","name":"dummy-absolute.com","slogan":null,"contacts":[{"method_type":"link","@L":"num://absolute-link.com:3/sub-page-1","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"person","object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"method_type":"link","@L":"/","description":"John","icon":"https://100px.logos.uk/link.media.num.uk.png"}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"/"}]}}}}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"John","@L":"num://absolute-link.com:3/sub-page-1"}]}},"metadata":{"errors":[]}}'
    );
  });

  it('Can expand two links that refer to the same NUM URI', async () => {
    const dummy = new DummyNumClient();

    const api = createCompanyApi(dummy);

    const result = await api.lookupUri(buildNumUri('same-uri.com'));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"object_display_name":"Organisation","object_type":"organization","name":"same-uri.com","slogan":null,"contacts":[{"method_type":"link","@L":"insurance","description":"Insurance","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_display_name":"Organisation","object_type":"organization","name":"same-uri.com","slogan":null,"contacts":[{"method_type":"link","@L":"/pets","description":"Pet Insurance","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"organization","object_display_name":"Organisation","name":"Pet Insurance","contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"}}]}}}},{"method_type":"link","@L":"/health","description":"Health Insurance","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"organization","object_display_name":"Organisation","name":"Health Insurance","contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"}}]}}}}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"Pet Insurance","@L":"/pets"},{"description":"Health Insurance","@L":"/health"}]}},"populated":1}},{"method_type":"link","@L":"health","description":"Health Insurance","icon":"https://100px.logos.uk/link.media.num.uk.png","numObject":{"object_type":"organization","object_display_name":"Organisation","name":"Health Insurance","contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"},"hours":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"object_display_name":"Telephone","description_default":"Call","prefix":"tel:","icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"value":{"original":"456456456","error":"Sms telephone number not in valid international format","display":"456456456","dial":"456456456"}}]}}}}],"methods":{"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"Insurance","@L":"insurance"},{"description":"Health Insurance","@L":"health"}]}},"populated":1,"metadata":{"errors":[]}}'
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setTimeoutMillis(_t: number): void {
    throw new Error('Method not implemented.');
  }

  createContext(numAddress: NumUri): Context {
    return new DummyContext(numAddress);
  }
  retrieveNumRecord(ctx: Context, handler?: CallbackHandler): Promise<string | null> {
    let r: string | null = null;

    if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"@p":1,"object_display_name":"Organisation","object_type":"organization","name":"dummy.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John"},{"method_type":"link","@L":"sub-page-2","description":"Jane"}]}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 3) {
      r = '{"@n":1,"images":[{"name":null,"type":"logo","variants":[{"url":"LX67y17q.jpg","mime":"image/jpg","width":1000,"height":1000}]}]}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"object_type":"person","object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"method_type":"telephone","object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","value":"123123","hours":null}]}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 3) {
      r = '{"@n":1,"images":[{"name":null,"type":"headshot","variants":[{"url":"1088937600.jpg","mime":"image/jpg","width":1000,"height":1000}]}]}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/sub-page-2' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"object_type":"person","object_display_name":"Person","name":"Jane Doe","bio":null,"contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":"456456456","hours":null}]}';
    } else if (ctx.numAddress.host.s === 'dummy.com' && ctx.numAddress.path.s === '/sub-page-2' && ctx.numAddress.port.n === 3) {
      r = null;
    } else if (ctx.numAddress.host.s === 'dummy-cyclic.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"object_type":"organization","object_display_name":"Organisation","name":"dummy-cyclic.com","slogan":null,"contacts":[{"method_type":"link","@L":"sub-page-1","description":"John"}]}';
    } else if (ctx.numAddress.host.s === 'dummy-cyclic.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 3) {
      r = null;
    } else if (ctx.numAddress.host.s === 'dummy-cyclic.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"object_type":"person","object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"method_type":"link","@L":"/","description":"John"}]}';
    } else if (ctx.numAddress.host.s === 'dummy-cyclic.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 3) {
      r = null;
    } else if (ctx.numAddress.host.s === 'dummy-absolute.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"object_type":"organization","object_display_name":"Organisation","name":"dummy-absolute.com","slogan":null,"contacts":[{"method_type":"link","@L":"num://absolute-link.com:3/sub-page-1","description":"John"}]}';
    } else if (ctx.numAddress.host.s === 'dummy-absolute.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 3) {
      r = null;
    } else if (ctx.numAddress.host.s === 'absolute-link.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"object_type":"person","object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"method_type":"link","@L":"/","description":"John"}]}';
    } else if (ctx.numAddress.host.s === 'absolute-link.com' && ctx.numAddress.path.s === '/sub-page-1' && ctx.numAddress.port.n === 3) {
      r = null;
    } else if (ctx.numAddress.host.s === 'same-uri.com' && ctx.numAddress.path.s === '/' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"@p":1,"object_display_name":"Organisation","object_type":"organization","name":"same-uri.com","slogan":null,"contacts":[{"method_type":"link","@L":"insurance","description":"Insurance"},{"method_type":"link","@L":"health","description":"Health Insurance"}]}';
    } else if (ctx.numAddress.host.s === 'same-uri.com' && ctx.numAddress.path.s === '/insurance' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"@p":1,"object_display_name":"Organisation","object_type":"organization","name":"same-uri.com","slogan":null,"contacts":[{"method_type":"link","@L":"/pets","description":"Pet Insurance"},{"method_type":"link","@L":"/health","description":"Health Insurance"}]}';
    } else if (ctx.numAddress.host.s === 'same-uri.com' && ctx.numAddress.path.s === '/health' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"object_type":"organization","object_display_name":"Organisation","name":"Health Insurance","contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":"456456456","hours":null}]}';
    } else if (ctx.numAddress.host.s === 'same-uri.com' && ctx.numAddress.path.s === '/pets' && ctx.numAddress.port.n === 1) {
      r =
        '{"@n":1,"object_type":"organization","object_display_name":"Organisation","name":"Pet Insurance","contacts":[{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"telephone","value":"456456456","hours":null}]}';
    } else {
      log.debug(`UNKNOWN numAddress = ${ctx.numAddress}`);
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
  setDnsEnv(env: string): void {
    this.env = env;
  }
  setModuleEnv(env: string): void {
    this.env = env;
  }
}

class DummyContext implements Context {
  public location = NumLocation.independent;
  public result: string | null = null;
  public readonly numAddress: NumUri;
  public targetExpandedSchemaVersion: string;
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
    this.targetExpandedSchemaVersion = '1';
  }

  setTargetExpandedSchemaVersion(v: string): void {
    this.targetExpandedSchemaVersion = v;
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
    log.info('QUERY REDIRECT: ' + redirect);
  }

  /**
   * Update the hosted query for the supplied redirect
   *
   * @param redirectTo the supplied redirect
   * @throws NumInvalidDNSQueryException on error
   * @throws NumInvalidRedirectException on error
   */
  handleHostedQueryRedirect(redirectTo: string): void {
    log.info('HOSTED QUERY REDIRECT: ' + redirectTo);
  }

  /**
   * Update the independent query for the supplied redirect
   *
   * @param redirectTo the supplied redirect
   * @throws NumInvalidDNSQueryException on error
   * @throws NumInvalidRedirectException on error
   */
  handleIndependentQueryRedirect(redirectTo: string): void {
    log.info('INDEPENDENT QUERY REDIRECT: ' + redirectTo);
  }
}
