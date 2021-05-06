# company-api

An API for aggregating NUM Contacts Module and Images Module Records into a single object using the [NUM Protocol](https://www.numprotocol.com/).

## Installation For Local Testing

- `git clone git@github.com:NUMtechnology/company-api.git`
- `npm install`
- `webpack`
- Open `test/index.html` in your browser.

## Installation For Use In An Application

- `npm install -s company-api`

## Simple Application Usage

```typescript
import { createCompanyApi } from './CompanyApi';

// Create an API instance
const api = createCompanyApi();

// Use it to look up a domain
api.lookupDomain('numexample.com').then((result) => {
  console.log(JSON.stringify(result));
});
```

## Supplying an Existing NUMClient Object

If you already have a NUMClient object you can re-use it.
```typescript
import { createClient } from 'num-client';
import { createCompanyApi } from './CompanyApi';

// (from another part of your application)
const existingClient = createClient();

// Inject the existing client when creating the API instance
const api = createCompanyApi(existingClient);

// Use it to look up a domain
api.lookupDomain('numexample.com').then((result) => {
  console.log(JSON.stringify(result));
});
```