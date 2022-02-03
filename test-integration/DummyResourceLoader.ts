/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync } from 'fs';
import loglevel, { Logger } from 'loglevel';
import { ResourceLoader } from 'num-client/dist/resourceloader';
import { AxiosResponse } from 'axios';

const log = loglevel as Logger;

export class DummyResourceLoader implements ResourceLoader {
  setenv(env: string): void {
    log.warn(`Ignoring call to setenv(${env})`);
  }
  async load(url: string): Promise<AxiosResponse<any> | null> {
    try {
      if (url.includes('/1/compact/v1/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: compactSchema1, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/1/expanded/v1/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: schema1v1, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/1/expanded/v2/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: schema1v2, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/3/expanded/v1/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: schema3v1, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/1/config.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: moduleSpec1, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/1/locales/en-gb.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: localeEnGb1, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/1/locales/en-us.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: localeEnUs1, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/1/transformation/c1-e1.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: schemaMap1, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/1/transformation/c1-e2.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: schemaMap2, status: 200, statusText: 'OK', headers: [], config: {} };
      }
      if (url.includes('/1/transformation/map.json')) {
        log.info('Returning local file for url: ' + url);
        return { data: transMap, status: 200, statusText: 'OK', headers: [], config: {} };
      }
    } catch (e) {
      if (e instanceof Error) {
        log.error(`Cannot load resource from ${url} - ${e.message}`);
      }
    }
    log.error(`Cannot load resource from ${url}`);
    return null;
  }
}
const compactSchema1 = JSON.parse(readFileSync('../modules/data/1/compact/v1/schema.json', {}).toString());
const schema1v1 = JSON.parse(readFileSync('../modules/data/1/expanded/v1/schema.json', {}).toString());
const schema1v2 = JSON.parse(readFileSync('../modules/data/1/expanded/v2/schema.json', {}).toString());
const schema3v1 = JSON.parse(readFileSync('../modules/data/3/expanded/v1/schema.json', {}).toString());
const moduleSpec1 = JSON.parse(readFileSync('../modules/data/1/config.json', {}).toString());
const localeEnGb1 = JSON.parse(readFileSync('../modules/data/1/locales/en-gb.json', {}).toString());
const localeEnUs1 = JSON.parse(readFileSync('../modules/data/1/locales/en-us.json', {}).toString());
const schemaMap1 = JSON.parse(readFileSync('../modules/data/1/transformation/c1-e1.json', {}).toString());
const schemaMap2 = JSON.parse(readFileSync('../modules/data/1/transformation/c1-e2.json', {}).toString());
const transMap = JSON.parse(readFileSync('../modules/data/1/transformation/map.json', {}).toString());
