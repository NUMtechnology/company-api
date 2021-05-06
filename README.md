# company-api

An API for aggregating Contacts Module and Images Module Records into a single object.

## Installation

- `git clone git@github.com:NUMtechnology/company-api.git`
- `npm install`
- `webpack`
- Open `test/index.html` in your browser.

## Simple Usage

```typescript
import { createCompanyApi } from './CompanyApi';

const api = createCompanyApi();

api.lookupDomain('numexample.com').then((result) => {
  console.log(JSON.stringify(result));
});
```

## Supplying a NUMClient Object

If you already have a NUMClient object you can re-use it.
```typescript
import { createClient } from 'num-client';
import { createCompanyApi } from './CompanyApi';

const existingClient = createClient();

const api = createCompanyApi(existingClient);

api.lookupDomain('numexample.com').then((result) => {
  console.log(JSON.stringify(result));
});
```