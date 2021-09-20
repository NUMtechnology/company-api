import { readFileSync } from 'fs';
import loglevel, { Logger } from 'loglevel';
import { ResourceLoader } from 'num-client/dist/resourceloader';

const log = loglevel as Logger;

export class DummyResourceLoader implements ResourceLoader {
  setenv(env: string): void {
    log.warn(`Ignoring call to setenv(${env})`);
  }
  async load(url: string): Promise<Record<string, unknown>> {
    try {
      if (url.includes('/1/compact-schema.json')) {
        log.info('Returning local file for url: ' + url);
        return compactSchema1;
      }
      if (url.includes('/1/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return schema1;
      }
      if (url.includes('/3/schema.json')) {
        log.info('Returning local file for url: ' + url);
        return schema3;
      }
      if (url.includes('/1/module-spec.json')) {
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
      if (url.includes('/1/schema-map.json')) {
        log.info('Returning local file for url: ' + url);
        return schemaMap1;
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
const compactSchema1 = JSON.parse(readFileSync('../modules/data/1/compact-schema.json', {}).toString());
const schema1 = JSON.parse(readFileSync('../modules/data/1/schema.json', {}).toString());
const schema3 = JSON.parse(readFileSync('../modules/data/3/schema.json', {}).toString());
const moduleSpec1 = JSON.parse(readFileSync('../modules/data/1/module-spec.json', {}).toString());
const localeEnGb1 = JSON.parse(readFileSync('../modules/data/1/locales/en-gb.json', {}).toString());
const localeEnUs1 = JSON.parse(readFileSync('../modules/data/1/locales/en-us.json', {}).toString());
const schemaMap1 = JSON.parse(readFileSync('../modules/data/1/schema-map.json', {}).toString());
