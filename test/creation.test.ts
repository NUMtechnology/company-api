import { expect } from 'chai';
import { createCompanyApi } from '../src/CompanyApi';

describe('Company API', () => {
  it('Can create a CompanyApi instance', () => {
    const api = createCompanyApi();
    expect(api).not.null;
  });
});
