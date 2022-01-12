import { readFileSync } from 'fs';
import loglevel, { Logger } from 'loglevel';
import { ResourceLoader } from 'num-client/dist/resourceloader';

const log = loglevel as Logger;

export class DummyResourceLoader implements ResourceLoader {
  setenv(env: string) {
    log.warn(`Ignoring call to setenv(${env})`);
  }
  async load(url: string): Promise<Record<string, unknown>> {
    try {
      if (url.includes('/1/compact/v1/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return compactSchema1;
      }
      if (url.includes('/1/expanded/v1/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return schema1v1;
      }
      if (url.includes('/1/expanded/v2/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return schema1v2;
      }
      if (url.includes('/3/expanded/v1/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return schema3v1;
      }
      if (url.includes('/1/config.json')) {
        log.info('Returning local file for url: ' + url);
        return moduleSpec1;
      }
      if (url.includes('/1/locales/en-gb.json')) {
        log.info('Returning local file for url: ' + url);
        return localeEnGb1;
      }
      if (url.includes('/1/locales/en-us.json')) {
        log.info('Returning local file for url: ' + url);
        return localeEnUs1;
      }
      if (url.includes('/1/transformation/c1-e1.json')) {
        log.info('Returning local file for url: ' + url);
        return schemaMap1;
      }
      if (url.includes('/1/transformation/c1-e2.json')) {
        log.info('Returning local file for url: ' + url);
        return schemaMap2;
      }
      if (url.includes('/1/transformation/map.json')) {
        log.info('Returning local file for url: ' + url);
        return transMap;
      }
    } catch (e) {
      if (e instanceof Error) {
        log.error(`Cannot load resource from ${url} - ${e.message}`);
      }
    }
    log.error(`Cannot load resource from ${url}`);
    return {};
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
