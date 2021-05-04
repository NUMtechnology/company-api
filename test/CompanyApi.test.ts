import { expect } from 'chai';
import { buildNumUri } from 'num-client';
import { createCompanyApi } from '../src/CompanyApi';

describe('Company API', () => {
  it('Can create a CompanyApi instance', () => {
    const api = createCompanyApi();
    expect(api).not.null;
  });

  it('Can lookup a NUM URI using a CompanyApi instance', async () => {
    const api = createCompanyApi();
    const result = await api.lookupUri(buildNumUri('fernoon.com'));
    expect(result).not.null;
    const resultStr = JSON.stringify(result);
    expect(resultStr).to.equal(
      '{"organisation":{"object_display_name":"Organisation","name":"fernoon.com","slogan":null,"contacts":[{"url":{"object_display_name":"Web URL","description_default":"Click","description":null,"prefix":"https://","method_type":"core","value":"fernoon.com"}},{"link":{"@L":"sub-page-1","description":"John","person":{"object_display_name":"Person","name":"John Doe","bio":null,"contacts":[{"telephone":{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"core","value":"123123","hours":null}}],"images":[{"name":null,"type":"headshot","variants":[{"url":"https://g.foolcdn.com/editorial/images/574231/older-man-with-concerned-expression-talking-on-phone_gettyimages-1088937600.jpg","mime":"image/jpg","width":2121,"height":1414}]}]}}},{"link":{"@L":"sub-page-2","description":"Jane","person":{"object_display_name":"Person","name":"Jane Doe","bio":null,"contacts":[{"telephone":{"object_display_name":"Telephone","description_default":"Call","description":null,"prefix":"tel:","method_type":"core","value":"456456456","hours":null}}]}}}],"images":[{"name":null,"type":"logo","variants":[{"url":"https://smilingfaces.co.uk/wp-content/uploads/2019/06/LX67y17q.jpg","mime":"image/jpg","width":1917,"height":1917}]}]}}'
    );
  });
});
