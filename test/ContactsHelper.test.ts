import { expect } from 'chai';
import ContactsModuleHelper from '../src/Contacts';

describe('ContactsHelper', () => {
  it('Can handle manually created contacts records.', async () => {
    const data = {
      '@n': 1,
      '@version': 2,
      object_type: 'organization',
      object_display_name: 'Organisation',
      name: 'Newcastle International Airport',
      slogan: null,
      contacts: [
        {
          method_type: 'url',
          method_display_name: 'Web URL',
          description_default: 'Click',
          description: 'Arrivals and Departures',
          action: 'https://www.newcastleairport.com/arrivals-departures',
          controller: null,
          value: 'www.newcastleairport.com/arrivals-departures',
        },
        {
          method_type: 'link',
          '@L': 'lostbaggage',
          description: 'Lost Baggage',
        },
        {
          method_type: 'telephone',
          method_display_name: 'Telephone',
          description: 'Customer Information',
          description_default: 'Call',
          action: 'tel:+44871 882 1121',
          value: '+44871 882 1121',
          controller: null,
          hours: {
            available: null,
            time_zone_location: 'LON',
          },
        },
        {
          method_type: 'telephone',
          method_display_name: 'Telephone',
          description: 'Flight Information',
          description_default: 'Call',
          action: 'tel:+44871 882 1131',
          value: '+44871 882 1131',
          controller: null,
          hours: {
            available: null,
            time_zone_location: 'LON',
          },
        },
        {
          method_type: 'telephone',
          method_display_name: 'Telephone',
          description: 'Lost Property',
          description_default: 'Call',
          action: 'tel:+44191 214 3367',
          value: '+44191 214 3367',
          controller: null,
          hours: {
            available: null,
            time_zone_location: 'LON',
          },
        },
        {
          method_type: 'twitter',
          method_display_name: 'Twitter',
          description_default: 'View Twitter profile',
          description: null,
          action: 'https://www.twitter.com/NCLairport',
          controller: 'twitter.com',
          value: '@NCLairport',
        },
        {
          method_type: 'facebook',
          method_display_name: 'Facebook',
          description_default: 'View Facebook profile',
          description: null,
          action: 'https://www.facebook.com/nclairport',
          controller: 'facebook.com',
          value: '/nclairport',
        },
        {
          method_type: 'instagram',
          method_display_name: 'Instagram',
          description_default: 'View Instagram profile',
          description: null,
          action: 'https://www.instagram.com/nclairport',
          controller: 'instagram.com',
          value: '@nclairport',
        },
        {
          method_type: 'linkedin',
          method_display_name: 'LinkedIn',
          description_default: 'View LinkedIn page',
          description: null,
          action: 'https://www.linkedin.com/company/newcastle-international-airport',
          controller: 'linkedin.com',
          value: '/company/newcastle-international-airport',
        },
        {
          method_type: 'youtube',
          method_display_name: 'YouTube',
          description: null,
          description_default: 'View YouTube channel',
          action: 'https://www.youtube.com/channel/UC4Td6ra9BD-Y2AffRiNKMvA',
          controller: 'youtube.com',
          value: '/channel/UC4Td6ra9BD-Y2AffRiNKMvA',
        },
        {
          method_type: 'pinterest',
          method_display_name: 'Pinterest',
          description_default: 'View Pinterest board',
          description: null,
          action: 'https://www.pinterest.com/nclairport',
          controller: 'pinterest.com',
          value: '/nclairport',
        },
        {
          method_type: 'address',
          method_display_name: 'Address',
          description: null,
          description_default: 'View Address',
          lines: ['Newcastle International Airport', 'Woolsington', 'Newcastle upon Tyne'],
          postcode: 'NE13 8BZ',
          country: 'GB',
          action: null,
          controller: null,
        },
      ],
    };

    const result = ContactsModuleHelper.transform(data, null, null);
    expect(JSON.stringify(result)).to.equal(
      '{"numVersion":1,"@version":2,"numObject":{"object_type":"organization","object_display_name":"Organisation","name":"Newcastle International Airport","slogan":null,"contacts":[{"method_type":"url","method_display_name":"Web URL","description_default":"Click","description":"Arrivals and Departures","action":"https://www.newcastleairport.com/arrivals-departures","controller":null,"value":"www.newcastleairport.com/arrivals-departures","icon":"https://100px.logos.uk/url.media.num.uk.png"},{"method_type":"link","@L":"lostbaggage","description":"Lost Baggage","icon":"https://100px.logos.uk/link.media.num.uk.png"},{"method_type":"telephone","method_display_name":"Telephone","description":"Customer Information","description_default":"Call","action":"tel:+44871 882 1121","value":"+44871 882 1121","controller":null,"hours":{"time_zone_location":"LON"},"icon":"https://100px.logos.uk/telephone.media.num.uk.png"},{"method_type":"telephone","method_display_name":"Telephone","description":"Flight Information","description_default":"Call","action":"tel:+44871 882 1131","value":"+44871 882 1131","controller":null,"hours":{"time_zone_location":"LON"},"icon":"https://100px.logos.uk/telephone.media.num.uk.png"},{"method_type":"telephone","method_display_name":"Telephone","description":"Lost Property","description_default":"Call","action":"tel:+44191 214 3367","value":"+44191 214 3367","controller":null,"hours":{"time_zone_location":"LON"},"icon":"https://100px.logos.uk/telephone.media.num.uk.png"},{"method_type":"twitter","method_display_name":"Twitter","description_default":"View Twitter profile","description":null,"action":"https://www.twitter.com/NCLairport","controller":"twitter.com","value":"@NCLairport","icon":"https://100px.logos.uk/twitter.media.num.uk.png"},{"method_type":"facebook","method_display_name":"Facebook","description_default":"View Facebook profile","description":null,"action":"https://www.facebook.com/nclairport","controller":"facebook.com","value":"/nclairport","icon":"https://100px.logos.uk/facebook.media.num.uk.png"},{"method_type":"instagram","method_display_name":"Instagram","description_default":"View Instagram profile","description":null,"action":"https://www.instagram.com/nclairport","controller":"instagram.com","value":"@nclairport","icon":"https://100px.logos.uk/instagram.media.num.uk.png"},{"method_type":"linkedin","method_display_name":"LinkedIn","description_default":"View LinkedIn page","description":null,"action":"https://www.linkedin.com/company/newcastle-international-airport","controller":"linkedin.com","value":"/company/newcastle-international-airport","icon":"https://100px.logos.uk/linkedin.media.num.uk.png"},{"method_type":"youtube","method_display_name":"YouTube","description":null,"description_default":"View YouTube channel","action":"https://www.youtube.com/channel/UC4Td6ra9BD-Y2AffRiNKMvA","controller":"youtube.com","value":"/channel/UC4Td6ra9BD-Y2AffRiNKMvA","icon":"https://100px.logos.uk/youtube.media.num.uk.png"},{"method_type":"pinterest","method_display_name":"Pinterest","description_default":"View Pinterest board","description":null,"action":"https://www.pinterest.com/nclairport","controller":"pinterest.com","value":"/nclairport","icon":"https://100px.logos.uk/pinterest.media.num.uk.png"},{"method_type":"address","method_display_name":"Address","description":null,"description_default":"View Address","lines":["Newcastle International Airport","Woolsington","Newcastle upon Tyne"],"postcode":"NE13 8BZ","country":"GB","action":null,"controller":null,"icon":"https://100px.logos.uk/address.media.num.uk.png"}],"methods":{"url":{"method_display_name":"Web URL","description_default":"Click","controller":null,"icon":"https://100px.logos.uk/url.media.num.uk.png","list":[{"action":"https://www.newcastleairport.com/arrivals-departures","description":"Arrivals and Departures","value":"www.newcastleairport.com/arrivals-departures"}]},"link":{"icon":"https://100px.logos.uk/link.media.num.uk.png","list":[{"description":"Lost Baggage","@L":"lostbaggage"}]},"telephone":{"method_display_name":"Telephone","description_default":"Call","controller":null,"icon":"https://100px.logos.uk/telephone.media.num.uk.png","list":[{"hours":{"time_zone_location":"LON"},"action":"tel:+44871 882 1121","description":"Customer Information","value":"+44871 882 1121"},{"hours":{"time_zone_location":"LON"},"action":"tel:+44871 882 1131","description":"Flight Information","value":"+44871 882 1131"},{"hours":{"time_zone_location":"LON"},"action":"tel:+44191 214 3367","description":"Lost Property","value":"+44191 214 3367"}]},"twitter":{"method_display_name":"Twitter","description_default":"View Twitter profile","controller":"twitter.com","icon":"https://100px.logos.uk/twitter.media.num.uk.png","list":[{"action":"https://www.twitter.com/NCLairport","value":"@NCLairport"}]},"facebook":{"method_display_name":"Facebook","description_default":"View Facebook profile","controller":"facebook.com","icon":"https://100px.logos.uk/facebook.media.num.uk.png","list":[{"action":"https://www.facebook.com/nclairport","value":"/nclairport"}]},"instagram":{"method_display_name":"Instagram","description_default":"View Instagram profile","controller":"instagram.com","icon":"https://100px.logos.uk/instagram.media.num.uk.png","list":[{"action":"https://www.instagram.com/nclairport","value":"@nclairport"}]},"linkedin":{"method_display_name":"LinkedIn","description_default":"View LinkedIn page","controller":"linkedin.com","icon":"https://100px.logos.uk/linkedin.media.num.uk.png","list":[{"action":"https://www.linkedin.com/company/newcastle-international-airport","value":"/company/newcastle-international-airport"}]},"youtube":{"method_display_name":"YouTube","description_default":"View YouTube channel","controller":"youtube.com","icon":"https://100px.logos.uk/youtube.media.num.uk.png","list":[{"action":"https://www.youtube.com/channel/UC4Td6ra9BD-Y2AffRiNKMvA","value":"/channel/UC4Td6ra9BD-Y2AffRiNKMvA"}]},"pinterest":{"method_display_name":"Pinterest","description_default":"View Pinterest board","controller":"pinterest.com","icon":"https://100px.logos.uk/pinterest.media.num.uk.png","list":[{"action":"https://www.pinterest.com/nclairport","value":"/nclairport"}]},"address":{"method_display_name":"Address","description_default":"View Address","controller":null,"icon":"https://100px.logos.uk/address.media.num.uk.png","list":[{"lines":["Newcastle International Airport","Woolsington","Newcastle upon Tyne"],"country":"GB","postcode":"NE13 8BZ"}]}}}}'
    );
  });
});
