import { faker } from '@faker-js/faker';

import dataOption from '../../data/options';
import percentages from '../../data/percentages';
import { Contact, ContactOptions, Status, Priority, Mode } from '../../types';
import { generateAlert } from '../alerts/generate-alert';
import { generateSubsystems } from '../subsystems/generate-subsystems';
import {
  between,
  generateEquipment,
  randomMinutes,
  randomSeconds,
  range,
  setModulus,
  setSecondModulus,
  shuffle,
  getDayOfYear,
  getSubsystemMnemonics,
} from '../../utils';

export const generateContact = (
  index: number,
  options?: ContactOptions,
): Contact => {
  if (options?.alertsPercentage) {
    const keys = Object.keys(percentages);
    const hasPercentage = keys.includes(options.alertsPercentage.toString());

    if (!hasPercentage) {
      const message = `options.alertsPercentage of ${options.alertsPercentage}% is not allowed.`;
      throw new Error(message);
    }
  }

  const count = index + 1;
  const contactId = faker.string.uuid();
  const modulus = setModulus(options?.alertsPercentage);
  const secondModulus = setSecondModulus(options?.secondAlertPercentage);
  const hasAlert = count % modulus === 0;
  const hasSecondAlert = count % secondModulus === 0;
  const alertsRange = hasAlert ? { start: 0, stop: hasSecondAlert ? 1 : 0 } : 0;

  // 1) start timestamp base off n number of days in the past
  const start = faker.date.recent(options?.daysRange, options?.dateRef);
  const beginTimestamp = start.getTime();

  // 2) end timestamp based off start and generates a random timestamp
  // between 20 and 60 minutes in the future
  const end = new Date(beginTimestamp + randomMinutes(20, 60));
  const endTimestamp = end.getTime();

  // 3) AOS (Acquisition of Signal) random number of seconds after start
  const aos = beginTimestamp + randomSeconds(60, 300);

  // 4) LOS (Loss of Signal) random number of seconds before end
  const los = endTimestamp - randomSeconds(60, 300);

  const equipment = generateEquipment();
  const subsystems = generateSubsystems(contactId, options?.subsystemOptions);

  return {
    id: contactId,
    type: 'contact',
    priority: shuffle<Priority>(dataOption.priorities),
    status: shuffle<Status>(dataOption.statuses),
    name: faker.number.int(),
    ground: shuffle(dataOption.grounds),
    rev: faker.number.int({ min: 1001, max: 9999 }),
    satellite: 'USA-' + faker.string.alphanumeric(5).toUpperCase(),
    equipment,
    subsystems,
    state: shuffle(dataOption.states),
    step: shuffle(dataOption.steps),
    detail: faker.lorem.sentence(between({ min: 8, max: 20 })),
    beginTimestamp,
    endTimestamp,
    aos,
    los,
    dayOfYear: getDayOfYear(new Date(beginTimestamp)),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    azimuth: faker.location.longitude(),
    elevation: faker.number.float({ max: 90 }),
    mode: shuffle<Mode>(dataOption.modes),
    resolution: shuffle(dataOption.resolutions),
    resolutionStatus: shuffle(dataOption.resolutionStatuses),
    selected: false,
    alerts: range(alertsRange).map(() => {
      return generateAlert({ end, equipment, contactRefId: contactId, start });
    }),
    mnemonics: getSubsystemMnemonics(subsystems),
  };
};
