/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// Copyright 2020 NUM Technology Ltd
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { parseNumber } from 'libphonenumber-js';
import metadata_min from 'libphonenumber-js/metadata.min.json';
import logger from 'loglevel';

const metadata = metadata_min;

export default class ContactsModuleHelper {
  /**
   * Transforms num records by expanding contacts to something more readeable
   * @param {*} numRecord the current num record
   * @param {Object} userVariables
   * @param {*} options parts of the contact record to expand.
   * Available options are expandTelephone, expandHours, expandObjects and expandOpeningDoW.
   */
  static transform(numRecord, userVariables, options): any {
    logger.debug('NUM Record before:', JSON.stringify(numRecord));

    const transformedNumRecord = {};

    if (!options) {
      options = {
        expandTelephone: true,
        expandSms: true,
        expandHours: true,
        expandObjects: true,
      };
    }

    const keys = Object.keys(numRecord);
    for (const objectKey of keys) {
      if (numRecord[objectKey].contacts) {
        let daysWithHours;

        // All associated entity objects must have a query, this function ensures they do
        ContactsModuleHelper.addQueryToObjects(numRecord[objectKey].contacts);
        // Get telephone numbers ready to dial
        ContactsModuleHelper.readyToDial(numRecord[objectKey].contacts);

        // Does the client want us to expand the hours object? This makes it easier for developers
        // to work with and can show opening hours for a specified number of days.
        if (options.expandHours) {
          if (options.daysWithHours) {
            daysWithHours = options.daysWithHours;
          } else {
            daysWithHours = 7;
          }

          ContactsModuleHelper.expandHours(numRecord, daysWithHours);
        }

        if (userVariables && userVariables['_C']) {
          // Does the client want us to expand the telephone number object? This helps to display telephone
          // numbers in the format that users will be familiar with and also display the country of any international numbers
          if (options.expandTelephone) {
            ContactsModuleHelper.expandTelephone(numRecord[objectKey].contacts, 'telephone', userVariables['_C']);
          }

          if (options.expandSms) {
            ContactsModuleHelper.expandTelephone(numRecord[objectKey].contacts, 'sms', userVariables['_C']);
          }
        }

        // Does the client want us to expand the associated objects for this record? It makes it
        // easier to work with media or entities. For example, if the object is expanded the client
        // can call organisation.media.telephone.list to get a list of telephone numbers or
        // organisation.entities.person.list to get a list of people associated with this organisation
        if (options.expandObjects) {
          // Yes, expand the object
          ContactsModuleHelper.expandObjects(numRecord);
        }
      } else {
        // Move specific metadata keys out of numRecord and into transformedNumRecord
        if (objectKey === '@n') {
          transformedNumRecord['numVersion'] = numRecord[objectKey];
          delete numRecord[objectKey];
        } else if (objectKey === '@p') {
          transformedNumRecord['populated'] = numRecord[objectKey];
          delete numRecord[objectKey];
        } else if (objectKey.startsWith('@')) {
          // Move all other top level @-prefixed values in the numRecord to the top level of the transformed object
          // on the assumption that they are metadata
          transformedNumRecord[objectKey] = numRecord[objectKey];
          delete numRecord[objectKey];
        }
      }
    }

    transformedNumRecord['numObject'] = numRecord;

    logger.debug('NUM Record after:', JSON.stringify(transformedNumRecord));

    return transformedNumRecord;
  }

  // This function is used to determine which of the metadata in NUM objects
  // are unique to each object and which hold repeating data, this is used
  // when expanding the object.
  static getKeyData(objectType, objectKey) {
    // Any object can have an introduction, hours and a query
    const keyData = ['introduction', 'hours', 'query'];
    if (objectType === 'entity') {
      // All entities also have a name and associated objects
      keyData.push('name', 'objects');
      if (objectKey === 'person' || objectKey === 'person_link') {
        // A person has a biography
        keyData.push('bio');
      } else if (objectKey === 'employee' || objectKey === 'employee_link') {
        // An employee has a role
        keyData.push('role');
      } else if (
        objectKey === 'location' ||
        objectKey === 'location_link' ||
        objectKey === 'group' ||
        objectKey === 'group_link' ||
        objectKey === 'department' ||
        objectKey === 'department_link'
      ) {
        // The rest have a description
        keyData.push('description');
      }
    } else if (objectType === 'method') {
      // Media have a description, value and accessibility
      keyData.push('description', 'value', 'accessibility');
    } else {
      // Its a 'link;
      keyData.push('description', '@L', 'object_display_name');
    }
    return keyData;
  }

  // This function finds the objects with the given name or value
  static getObjects(obj, key, returnType = 'value') {
    let objects: Array<any> = [];

    // Loop through the elements in the object
    for (const i in obj) {
      // If for some reason the element can't be found in the object then "continue"
      // to the next cycle of the loop - "continue" would be better described as "skip"
      // eslint-disable-next-line no-prototype-builtins
      if (!obj.hasOwnProperty(i)) continue;

      if (i === key) {
        // Found the object with the matching key
        if (returnType === 'value') {
          // Add the value of the object to the array
          objects.push(obj[key]);
        } else {
          // Add the object to the array
          objects.push(obj);
        }
      }
      // Is it an object?
      else if (typeof obj[i] == 'object') {
        if (i === key && obj[i].constructor.name === 'Array') {
          if (returnType === 'value') {
            // Add the value of the object to the array
            objects.push(obj[key]);
          } else {
            // Add the object to the array
            objects.push(obj);
          }
        } else {
          objects = objects.concat(ContactsModuleHelper.getObjects(obj[i], key, returnType));
        }
      }
    }
    // Return the array of matching objects
    return objects;
  }

  static readyToDial(objects) {
    for (const object of objects) {
      const objectKey = Object.keys(object)[0];
      const objectType = ContactsModuleHelper.objectKeyToObjectType(objectKey);
      if (objectType === 'method' && (objectKey === 'telephone' || objectKey === 'sms')) {
        // if number starts with zero or has brackets or dashes then it's not in the correct format.
        // Assume that it's ready to dial for domestic users but send error
        const objectValue = object[objectKey].value;
        if (objectValue.substring(0, 1) === '0' || objectValue.indexOf(')') > -1 || objectValue.indexOf('(') > -1 || objectValue.indexOf('|') > -1) {
          logger.error(`Error: Telephone number '${objectValue}' not internationally formatted.`);
        } else {
          // if it isn't already plus prefixed, then prefix it
          if (objectValue.substring(0, 1) !== '+') {
            object[objectKey].value = '+' + objectValue;
          }
        }
      }
    }
  }

  static addQueryToObjects(objects) {
    for (const object of objects) {
      const objectKey = Object.keys(object)[0];
      const objectType = ContactsModuleHelper.objectKeyToObjectType(objectKey);

      if (objectType === 'entity') {
        const objectName = object[objectKey].name.trim();

        if (!object[objectKey]['@L']) {
          let queryToAdd;

          // Add a query to the object based on the object name
          if (objectKey === 'organisation' || objectKey === 'organisation_link') {
            // For organisations, the query is set to the object name
            queryToAdd = objectName;
          } else {
            if (objectName.substring(0, 1) === '^') {
              object[objectKey].name = objectName.substring(1, objectName.length);
            }

            if (objectKey === 'person' || objectKey === 'person_link') {
              // The query for people is the object name with spaces replaced by dots
              queryToAdd = objectName.replace(/ /g, '.');
            } else {
              // The query for any other object is the object name with spaces replaced by underscores
              queryToAdd = objectName.replace(/ /g, '_');
            }
          }

          object[objectKey]['@L'] = queryToAdd.toLowerCase();
        }
      }
    }
  }

  /**
   * Expands the NUM object to make it more developer friendly
   * @param numObject
   */
  static expandObjects(numObject) {
    // We need the object key to find out what type of object this is
    const keys = Object.keys(numObject);

    for (const key of keys) {
      if (numObject[key] && numObject[key].contacts) {
        const organisation = numObject[key];

        // Does this object have associated objects?
        if (organisation.contacts) {
          const contacts = organisation.contacts;
          // Loop through the associated objects
          for (const contact of contacts) {
            const objectKey = Object.keys(contact).toString();
            let objectType = ContactsModuleHelper.objectKeyToObjectType(objectKey);
            if (!objectType) {
              objectType = 'link';
            }
            const collectiveTerm = ContactsModuleHelper.getPlural(objectType);

            // Add an image for for each
            this.addImage(contact[objectKey], objectType, objectKey);

            // Duplicate the object
            const dupeObject = JSON.parse(JSON.stringify(contact));
            // Entities must have a query value, so if they don't have one then derive it from the name

            // Do we already have an object with a key of the collective name, e.g. "media"?
            if (!organisation[collectiveTerm]) {
              // No, create one
              organisation[collectiveTerm] = {};
            }
            // Do we already have an object containing this object type within the object found/created above?
            // e.g. media.telephone
            if (!organisation[collectiveTerm][objectKey]) {
              // No, create it
              const keysToIgnore = ContactsModuleHelper.getKeyData('method', objectKey);
              // Ignore the object_type key too
              keysToIgnore.push('object_type');
              // Create the object, copying only the repetitive data, e.g. display name, prefix, etc
              organisation[collectiveTerm][objectKey] = ContactsModuleHelper.copyObjectParts(dupeObject[objectKey], keysToIgnore);
            }
            // What's the key data for this object - e.g. description, value, hours
            // Metadata that's unique for each object?
            const keyData = ContactsModuleHelper.getKeyData(objectType, objectKey);
            // Do we already have a list of values for this object type?
            // e.g. media.telephone.list
            if (!organisation[collectiveTerm][objectKey].list) {
              // Not, create one
              organisation[collectiveTerm][objectKey].list = [];
            }
            // Add an empty object to the list
            const thisObject = {};
            organisation[collectiveTerm][objectKey].list.push(thisObject);

            // Loop through the key data for this object
            for (const ky of keyData) {
              // Get the key field name
              if (dupeObject[objectKey][ky]) {
                // Add the keydata to the object
                thisObject[ky] = dupeObject[objectKey][ky];
              }
            }
          }
        }
      }
    }
  }

  /**
   * Shows the plural name of the object types
   * @param {String} singular
   * @returns {String} plural
   */
  static getPlural(singular) {
    let plural = singular;
    if (singular === 'entity') {
      plural = 'entities';
    }

    return plural;
  }

  /// Add an image to each NUM record and each associated object
  static addImage(object, objectType, objectKey) {
    let metaName, imageName;
    if (objectType === 'entity') {
      if (objectKey === 'organisation' || objectKey === 'organisation_link') {
        // Organisations are given a logo
        metaName = 'logo';
        imageName = `${object['@L']}.png`;
      } else {
        // Other entities are given an img
        metaName = 'img';
        if (object['@L'] != null) {
          imageName = `${object['@L']}.png`;
        } else {
          imageName = `holding.${objectKey}.entities.num.uk.png`;
        }
      }
    } else if (objectType === 'method') {
      // Media have an icon
      metaName = 'icon';
      imageName = `${objectKey}.media.num.uk.png`;
    } else if (objectType === 'link') {
      return;
    }

    // Add the image to the object
    object[metaName] = `https://100px.logos.uk/${imageName}`;
  }

  /**
   * Used when expanding the object, for example each medium object is copied
   * over into a parent object which makes it easier to access
   * @param objectToCopy
   * @param keysToIgnore
   */
  static copyObjectParts(objectToCopy, keysToIgnore) {
    const returnObject = {};
    // Get standard metadata (data that doesn't change) – this is the data we're going to
    // ignore and not copy over
    // Loop through each element in the object we want to copy
    for (const key in objectToCopy) {
      // eslint-disable-next-line no-prototype-builtins
      if (objectToCopy.hasOwnProperty(key)) {
        // If the metadata is useful then add it to the return object
        if (!keysToIgnore.includes(key)) {
          returnObject[key] = objectToCopy[key];
        }
      }
    }
    return returnObject;
  }

  static isEmptyObject(objectToCheck) {
    return Object.keys(objectToCheck).length === 0 && objectToCheck.constructor === Object;
  }

  static expandTelephone(objects, key, userCountry) {
    for (const object of objects) {
      const objectKey = Object.keys(object)[0];
      const objectType = ContactsModuleHelper.objectKeyToObjectType(objectKey);
      if (objectType === 'method' && objectKey === key) {
        // Expand this number
        const telephoneNumber = object[objectKey].value;

        object[objectKey].value = { original: telephoneNumber };
        const parsedNumber = parseNumber(telephoneNumber);

        if (ContactsModuleHelper.isEmptyObject(parsedNumber)) {
          object[objectKey].value.error = 'Sms telephone number not in valid international format';
          object[objectKey].value.display = telephoneNumber;
          object[objectKey].value.dial = telephoneNumber;
        } else {
          const telephoneCountry = parsedNumber['country'];
          object[objectKey].value.country = telephoneCountry;

          if (telephoneCountry.toLowerCase() === userCountry.toLowerCase()) {
            // display local format
            const country = metadata.countries[telephoneCountry];
            const internationalPrefix = '+' + country[0];
            const nationalPrefix = country[5];

            if (telephoneNumber.startsWith(internationalPrefix)) {
              object[objectKey].value.display = telephoneNumber.replace(internationalPrefix, nationalPrefix);
            }

            object[objectKey].value.dial = telephoneNumber;
          } else {
            // display international format
            object[objectKey].value.display = telephoneNumber;
            object[objectKey].value.dial = telephoneNumber;
          }
        }
      }
    }
  }

  /**
   * Used to expand the hours object into a more developer friendly object
   */
  static expandHours(recordObject, daysWithHours) {
    const keys = Object.keys(recordObject);

    for (const objectKey of keys) {
      // Find all of the hours objects
      const hourSettings = ContactsModuleHelper.getObjects(recordObject[objectKey], 'hours', 'obj');

      // Loop through each of the hours objects
      for (const setting of hourSettings) {
        let hoursArray = setting.hours.available;
        if (hoursArray === undefined) {
          hoursArray = [];
        }
        const timeZoneCity = setting.hours.time_zone_location;
        logger.debug(`Time zone city: ${timeZoneCity}`);

        // Put the original string in the hours object
        const hoursObject = { original: hoursArray };
        // Create an array of days, displaying the amount defined in client settings
        hoursObject['days'] = ContactsModuleHelper.displayDays(daysWithHours);
        // Select the empty days array
        const daysObject = hoursObject['days'];

        // Loop through the hours settings
        for (const hoursItem of hoursArray) {
          // Split the hours by the @ sign, hours must be in the form:
          // day-descriptor@time-descriptor@time-zone-city
          // time-zone-city can be omitted if there"s a timezone in the parent object
          const hourPartsArray = hoursItem.split('@');

          let dayDescriptor, timeDescriptor;

          // If the parent object has a timezone and the hours object doesn"t
          if (hourPartsArray.length === 2) {
            // Build the hours object based on the day and time descriptor based on the parent time zone
            dayDescriptor = hourPartsArray[0];
            timeDescriptor = hourPartsArray[1];
          } else {
            // Invalid hours object
            hoursObject['error'] = 'Invalid hours object';
          }

          // Loop through the amount of days to show with hours (daysWithHours)
          for (let x = 0; x < daysWithHours; x++) {
            // Does the day descriptor for this hours object match this day?
            if (ContactsModuleHelper.checkDayDescriptor(dayDescriptor, daysObject[x].date)) {
              // Yes, set the times that this object is available
              daysObject[x].available = ContactsModuleHelper.setTimes(timeDescriptor);
            } else {
              // No, do nothing
            }
          }
        }
        // Is this object available now?
        if (ContactsModuleHelper.availableNow(daysObject[0].available)) {
          // Yes
          hoursObject['available_now'] = true;
        } else {
          // No
          hoursObject['available_now'] = false;
        }

        // Set the hours of this object to the object created in the code above
        setting.hours = hoursObject;
      }
    }
  }

  /**
   * Used for displaying an array of days
   */
  static displayDays(days) {
    const daysObj: Array<any> = [];
    const today = new Date();

    // Loop through days 1 - days variable (default 7)
    for (let i = 0; i < days; i++) {
      // Set the date for this loop to today + i days
      const thisDate = ContactsModuleHelper.addDays(today, i);
      // Set a reliable international date format, e.g. 2018-08-01
      const formattedDate =
        ContactsModuleHelper.twoDigits(thisDate.getFullYear()) +
        '-' +
        ContactsModuleHelper.twoDigits(thisDate.getMonth() + 1) +
        '-' +
        ContactsModuleHelper.twoDigits(thisDate.getDate());
      // Use this date for the date array
      daysObj.push({ date: formattedDate });
      // Set a default value for the available hours – closed all day
      daysObj[i]['available'] = ['00:00:00-00:00:00'];
    }

    return daysObj;
  }

  // This function sets times for the days
  static setTimes(hours) {
    // Sometimes multiple hour ranges are supplied
    const splitHours = hours.split(',');
    const returnArray: Array<string> = [];

    // Loop through the amount of hour settings
    for (const hour of splitHours) {
      // Split the hours into a start and end time
      const hourParts = hour.split('-');
      // Is there only one part?
      if (hourParts.length === 1) {
        // Yes, it's invalid
        logger.error('Invalid hour range');
        return ['00:00-00:00'];
      } else {
        // Add these times to the array
        const from = ContactsModuleHelper.convertToTime(hourParts[0]);
        const to = ContactsModuleHelper.convertToTime(hourParts[1]);

        const openingTimes = `${from}-${to}`;

        returnArray.push(openingTimes);
      }
    }

    return returnArray;
  }

  // This function determines whether the object is available now
  static availableNow(availableHours) {
    // Are the available hours set to none?
    if (availableHours.length === 1 && availableHours[0] === '00:00:00-00:00:00') {
      // Yes, the object is not available now
      return false;
    } else {
      // No, the object could be available now, run further checks
      // Loop through the settings in available hours
      for (const available of availableHours) {
        // Get this available hours setting and split it into a start and end time
        const availableParts = available.split('-');

        const now = new Date();
        const compareTime =
          ContactsModuleHelper.twoDigits(now.getHours()) +
          ':' +
          ContactsModuleHelper.twoDigits(now.getMinutes()) +
          ':' +
          ContactsModuleHelper.twoDigits(now.getSeconds());
        // Is the current time more than the opening time and less than the closing time
        if (compareTime > availableParts[0] && compareTime < availableParts[1]) {
          // Yes, it's available
          return true;
        }

        // There's no else because we need to check other times in the range
      }

      // If we reach this point the current time isn't between any of the opening times so it
      // is not available.
      return false;
    }
  }

  // This function converts a NUM date string into a javascript date and vice versa
  static convertDate(theDate, type) {
    if (type === 'obj') {
      // Convert it into a javascript formatted date string
      return theDate.slice(0, 4) + '-' + theDate.slice(4, 6) + '-' + theDate.slice(6, 8);
    } else {
      // Convert it into a NUM formatted date string
      return theDate.getFullYear().toString() + ContactsModuleHelper.twoDigits(theDate.getMonth() + 1) + ContactsModuleHelper.twoDigits(theDate.getDate());
    }
  }

  // This function converts a NUM time string into a javascript time string and vice versa
  static convertToTime(timeStr) {
    let timeParts, hour, minutes, seconds;
    // Does it have a time split?
    if (timeStr.includes('.')) {
      // Yes
      timeParts = timeStr.split('.');
      // We know it must be at least hours and minutes
      hour = ContactsModuleHelper.twoDigits(timeParts[0]);
      if (timeParts.length > 1 && timeParts[1].length > 0) {
        // Set the minutes
        minutes = ContactsModuleHelper.twoDigits(timeParts[1]);
      } else {
        // Default the minutes to 00
        minutes = '00';
      }

      if (timeParts.length > 2 && timeParts[2].length > 0) {
        // Set the seconds
        seconds = ContactsModuleHelper.twoDigits(timeParts[2]);
      } else {
        // Default the minutes to 00
        seconds = '00';
      }
    } else {
      // There's only one number supplied, treat this as hour
      try {
        if (parseInt(timeStr) <= 24) {
          hour = ContactsModuleHelper.twoDigits(timeStr);
        }
      } catch (err) {
        hour = '00';
      }
      minutes = '00';
      seconds = '00';
    }
    // Is the hour 24?
    if (hour === '24') {
      // Set the time to 1 second before midnight
      return '23:59:59';
    } else {
      // Set the precise time
      return hour + ':' + minutes + ':' + seconds;
    }
  }

  // This function checks if a given day matches a day descriptor
  static checkDayDescriptor(dayDescriptor, checkDate): boolean {
    let checkDays: Array<any> = [];
    // Does the day descriptor include more than one?
    if (dayDescriptor.includes(',')) {
      // Yes, split it into an array
      checkDays = dayDescriptor.split(',');
    }
    // Does the day descriptor include a range?
    else if (dayDescriptor.includes('-')) {
      // Yes, split the day range
      const rangeParts = dayDescriptor.split('-');
      // Are there two parts?
      if (rangeParts.length === 2) {
        // Yes, the first part is start
        let rangeStart = rangeParts[0];
        // The second part is end
        let rangeEnd = rangeParts[1];
        // this is a day range
        const dayNumbers = ['1', '2', '3', '4', '5', '6', '7'];
        // Are both the day range start and the day range end a number 1-7
        if (dayNumbers.includes(rangeStart) && dayNumbers.includes(rangeEnd)) {
          // Yes, it's a day number range, e.g. 1-4 (Monday-Thursday)
          // Loop through these days
          for (let i = 0; i < rangeEnd; i++) {
            // Add these individual day numbers to the checkDays array
            checkDays.push(i + 1);
          }
        } else {
          // No, treat it as a specified date range, e.g. 20180101-20180601
          rangeStart = ContactsModuleHelper.convertDate(rangeStart, 'obj');
          rangeEnd = ContactsModuleHelper.convertDate(rangeEnd, 'obj');

          const start = new Date(rangeStart);
          const end = new Date(rangeEnd);

          let thisDate = new Date(start);
          // Loop through these dates from the start to the end
          while (thisDate <= end) {
            // Add them to the checkDays array
            checkDays.push(ContactsModuleHelper.convertDate(thisDate, 'str'));
            // Add a day to the current date
            const newDate = thisDate.setDate(thisDate.getDate() + 1);
            thisDate = new Date(newDate);
          }
        }
      } else {
        logger.error('Error: invalid day range.');
        return false;
      }
    } else {
      // This is a single day
      checkDays = [dayDescriptor];
    }

    checkDate = new Date(checkDate);

    // If there are no days to check then this is not a match
    if (checkDays === []) {
      return false;
    } else {
      const jsDayNum = checkDate.getDay();
      let dayNum;
      if (jsDayNum === 0) {
        dayNum = 7;
      } else {
        dayNum = jsDayNum;
      }

      const checkDateDayNumber = dayNum;

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      // There are days to check
      // Loop through the days to check
      for (const checkDay of checkDays) {
        // Check to see if the day fits into the descriptor
        if (checkDay === 'd') {
          return true;
        } else if (checkDay === 'wd' || checkDay === 'we') {
          // Is checkDate a weekday or weekend?
          const thisDayName = days[checkDateDayNumber - 1];
          // Is checkday "wd" and the day we're checking NOT a saturday or sunday?
          if (checkDay === 'wd' && thisDayName !== 'Saturday' && thisDayName !== 'Sunday') {
            // Yes, that's right - match
            return true;
          }
          // Is checkday "we" and the day we're checking IS a saturday or sunday?
          else if (checkDay === 'we' && (thisDayName === 'Saturday' || thisDayName === 'Sunday')) {
            // Yes, that's right - match
            return true;
          }
        }
        // Is checkday a number between 1-7
        else if (['1', '2', '3', '4', '5', '6', '7'].includes(checkDay)) {
          // Yes
          // Set a checking variable, NUM uses 1 for Monday, Javascript uses 0 for Sunday
          // Is the checkday the same number as this day?
          if (checkDay.toString() === checkDateDayNumber.toString()) {
            // Yes, match
            return true;
          }
        }
        // Is checkday a date?
        else if (checkDay.length === 8) {
          // Yes, it specifies a day
          // Does checkday equal the day we're checking
          if (checkDay === ContactsModuleHelper.convertDate(checkDate, 'str')) {
            // Yes, match
            return true;
          }
        } else {
          // This is an unrecognised day descriptor
          return false;
        }
      }
    }
    return false;
  }

  // This simple function ensures a number is two digits by prefixing number 0-9 with a zero
  static twoDigits(number) {
    if (number.toString().length === 1) {
      return '0' + number.toString();
    } else {
      return number.toString();
    }
  }

  static addDays(theDate, days) {
    const date = new Date(theDate);
    date.setDate(date.getDate() + days);
    return date;
  }

  static objectKeyToObjectType(objectKey) {
    if (
      objectKey === 'organisation' ||
      objectKey === 'person' ||
      objectKey === 'employee' ||
      objectKey === 'group' ||
      objectKey === 'department' ||
      objectKey === 'locatiom'
    ) {
      return 'entity';
    } else if (objectKey === 'link') {
      return 'link';
    }
    return 'method';
  }
}
