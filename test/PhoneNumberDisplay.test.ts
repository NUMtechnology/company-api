import { expect } from 'chai';
import ContactsModuleHelper from '../src/Contacts';

describe('Phone Number Display', () => {
  it('can display UK phone numbers correctly in the UK.', async () => {
    const data = {
      '@n': 1,
      '@version': 2,
      object_type: 'organization',
      object_display_name: 'Organisation',
      name: 'Newcastle International Airport',
      slogan: null,
      contacts: [
        {
          method_type: 'telephone',
          method_display_name: 'Telephone',
          description: 'Customer Information',
          description_default: 'Call',
          action: 'tel:+448718 882 121',
          value: '+448718 882 121',
          controller: null,
          hours: {
            available: null,
            time_zone_location: 'LON',
          },
        },
      ],
    };

    const result = ContactsModuleHelper.transform(data, { _C: 'gb' }, null);
    expect(JSON.stringify(result)).to.equal(
      '{"numVersion":1,"@version":2,"numObject":{"object_type":"organization","object_display_name":"Organisation","name":"Newcastle International Airport","slogan":null,"contacts":[{"method_type":"telephone","method_display_name":"Telephone","description":"Customer Information","description_default":"Call","action":"tel:+448718 882 121","value":{"original":"+448718 882 121","country":"GB","display":"08718 882 121","dial":"+448718882121"},"controller":null,"hours":{"time_zone_location":"LON"},"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"method_display_name":"Telephone","description_default":"Call","controller":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"hours":{"time_zone_location":"LON"},"action":"tel:+448718 882 121","description":"Customer Information","value":{"original":"+448718 882 121","country":"GB","display":"08718 882 121","dial":"+448718882121"}}]}}}}'
    );
  });

  it('can display UK phone numbers correctly in the US.', async () => {
    const data = {
      '@n': 1,
      '@version': 2,
      object_type: 'organization',
      object_display_name: 'Organisation',
      name: 'Newcastle International Airport',
      slogan: null,
      contacts: [
        {
          method_type: 'telephone',
          method_display_name: 'Telephone',
          description: 'Customer Information',
          description_default: 'Call',
          action: 'tel:+448718 882 121',
          value: '+448718 882 121',
          controller: null,
          hours: {
            available: null,
            time_zone_location: 'LON',
          },
        },
      ],
    };

    const result = ContactsModuleHelper.transform(data, { _C: 'us' }, null);
    expect(JSON.stringify(result)).to.equal(
      '{"numVersion":1,"@version":2,"numObject":{"object_type":"organization","object_display_name":"Organisation","name":"Newcastle International Airport","slogan":null,"contacts":[{"method_type":"telephone","method_display_name":"Telephone","description":"Customer Information","description_default":"Call","action":"tel:+448718 882 121","value":{"original":"+448718 882 121","country":"GB","display":"+44 8718 882 121","dial":"+448718882121"},"controller":null,"hours":{"time_zone_location":"LON"},"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"method_display_name":"Telephone","description_default":"Call","controller":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"hours":{"time_zone_location":"LON"},"action":"tel:+448718 882 121","description":"Customer Information","value":{"original":"+448718 882 121","country":"GB","display":"+44 8718 882 121","dial":"+448718882121"}}]}}}}'
    );
  });

  it('can display US phone numbers correctly in the UK.', async () => {
    const data = {
      '@n': 1,
      '@version': 2,
      object_type: 'organization',
      object_display_name: 'Organisation',
      name: 'Newcastle International Airport',
      slogan: null,
      contacts: [
        {
          method_type: 'telephone',
          method_display_name: 'Telephone',
          description: 'Customer Information',
          description_default: 'Call',
          action: 'tel:+1 75 76 77 47 01',
          value: '+1 75 76 77 47 01',
          controller: null,
          hours: {
            available: null,
            time_zone_location: 'LON',
          },
        },
      ],
    };

    const result = ContactsModuleHelper.transform(data, { _C: 'gb' }, null);
    expect(JSON.stringify(result)).to.equal(
      '{"numVersion":1,"@version":2,"numObject":{"object_type":"organization","object_display_name":"Organisation","name":"Newcastle International Airport","slogan":null,"contacts":[{"method_type":"telephone","method_display_name":"Telephone","description":"Customer Information","description_default":"Call","action":"tel:+1 75 76 77 47 01","value":{"original":"+1 75 76 77 47 01","country":"US","display":"+1 75 76 77 47 01","dial":"+17576774701"},"controller":null,"hours":{"time_zone_location":"LON"},"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"method_display_name":"Telephone","description_default":"Call","controller":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"hours":{"time_zone_location":"LON"},"action":"tel:+1 75 76 77 47 01","description":"Customer Information","value":{"original":"+1 75 76 77 47 01","country":"US","display":"+1 75 76 77 47 01","dial":"+17576774701"}}]}}}}'
    );
  });

  it('can display US phone numbers correctly in the US.', async () => {
    const data = {
      '@n': 1,
      '@version': 2,
      object_type: 'organization',
      object_display_name: 'Organisation',
      name: 'Newcastle International Airport',
      slogan: null,
      contacts: [
        {
          method_type: 'telephone',
          method_display_name: 'Telephone',
          description: 'Customer Information',
          description_default: 'Call',
          action: 'tel:+1 75 76 77 47 01',
          value: '+1 75 76 77 47 01',
          controller: null,
          hours: {
            available: null,
            time_zone_location: 'LON',
          },
        },
      ],
    };

    const result = ContactsModuleHelper.transform(data, { _C: 'us' }, null);
    expect(JSON.stringify(result)).to.equal(
      '{"numVersion":1,"@version":2,"numObject":{"object_type":"organization","object_display_name":"Organisation","name":"Newcastle International Airport","slogan":null,"contacts":[{"method_type":"telephone","method_display_name":"Telephone","description":"Customer Information","description_default":"Call","action":"tel:+1 75 76 77 47 01","value":{"original":"+1 75 76 77 47 01","country":"US","display":"75 76 77 47 01","dial":"+17576774701"},"controller":null,"hours":{"time_zone_location":"LON"},"icon":"https://100px.logos.uk/telephone.media.num.uk.png"}],"methods":{"telephone":{"method_display_name":"Telephone","description_default":"Call","controller":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"hours":{"time_zone_location":"LON"},"action":"tel:+1 75 76 77 47 01","description":"Customer Information","value":{"original":"+1 75 76 77 47 01","country":"US","display":"75 76 77 47 01","dial":"+17576774701"}}]}}}}'
    );
  });
});
