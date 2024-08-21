import { faker } from '@faker-js/faker';

import dataOption from '../data/options';
import percentages from '../data/percentages';
import {
  AlertsPercentage,
  BetweenOptions,
  RangeOptions,
  Status,
  Contact,
  ModifyMnemonicParams,
  Mnemonic,
  Subsystem,
  AITMnemonicDefinition,
  AITMnemonics
} from '../types';
import * as _ from 'lodash';

export const range = (options: RangeOptions): number[] => {
  if (typeof options === 'number') {
    return Array.from({ length: options }, (_, i) => 0 + i);
  }
  const { start, stop, step = 1 } = options;
  const length = (stop - start) / step + 1;
  return Array.from({ length }, (_, i) => start + i * step);
};

export const between = (options?: BetweenOptions) => {
  return faker.number.int(options);
};

export const shuffle = <T>(arr: T[]) => {
  const shuffled = faker.helpers.shuffle<T>(arr);
  return shuffled[between(arr.length - 1)];
};

export const generateEquipment = () => {
  const shuffled = faker.helpers.shuffle(dataOption.equipments);
  const prefixes = shuffled.slice(0, between({ min: 5, max: 7 }));
  const equipments = prefixes.map((prefix) => {
    return prefix + between({ min: 1, max: 20 });
  });

  return equipments.sort().join(' ').toUpperCase();
};

export const setModulus = (percentage?: AlertsPercentage) => {
  if (typeof percentage === 'number') return percentages[percentage];
  return 10;
};

export const setSecondModulus = (percentage?: AlertsPercentage) => {
  if (typeof percentage === 'number') return percentages[percentage];
  return 50;
};

export const randomMinutes = (min: number, max: number) => {
  return 1000 * 60 * between({ min, max });
};

export const randomSeconds = (min: number, max: number) => {
  return 1000 * between({ min, max });
};

export const getDayOfYear = (date: Date) => {
  const start = Number(new Date(date.getFullYear(), 0, 0));
  const diff = Number(date) - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
};

export const getMostSevereStatus = (dataArray: any): Status => {
  if (dataArray.some((entity: any) => entity.status === 'critical')) {
    return 'critical';
  }
  if (dataArray.some((entity: any) => entity.status === 'serious')) {
    return 'serious';
  }
  if (dataArray.some((entity: any) => entity.status === 'caution')) {
    return 'caution';
  }
  if (dataArray.some((entity: any) => entity.status === 'normal')) {
    return 'normal';
  }
  if (dataArray.some((entity: any) => entity.status === 'standby')) {
    return 'standby';
  }
  return 'off';
};

export const evaluateStatus = (
  currentValue: number,
  minThreshold: number,
  maxThreshold: number,
  seriousThresholdPercentage: number = 10,
  cautionThresholdPercentage: number = 20,
): Status => {
  if (currentValue >= maxThreshold || currentValue <= minThreshold)
    return 'critical';

  const acceptableRange = maxThreshold - minThreshold;

  const differenceToMax = maxThreshold - currentValue;
  const maxWithinPercentage = (differenceToMax / acceptableRange) * 100;

  const differenceToMin = currentValue - minThreshold;
  const minWithinPercentage = (differenceToMin / acceptableRange) * 100;

  if (
    maxWithinPercentage <= seriousThresholdPercentage ||
    minWithinPercentage <= seriousThresholdPercentage
  )
    return 'serious';

  if (
    maxWithinPercentage <= cautionThresholdPercentage ||
    minWithinPercentage <= cautionThresholdPercentage
  )
    return 'caution';

  return 'normal';
};

export const getSubsystemMnemonics = (subsystems: Subsystem[]): Mnemonic[] => {
  const subsystemsMnemonics: Mnemonic[] = [];

  subsystems.forEach((subsystem) => {
    subsystem.childSubsystems.forEach((childSubsystem) => {
      childSubsystem.assemblyDevices.forEach((assemblyDevices) => {
        subsystemsMnemonics.push(...assemblyDevices.mnemonics);
      });
    });
  });
  return subsystemsMnemonics;
};


export const updateSubsystemWithMnemonic = (
  currentContact: Contact,
  params: ModifyMnemonicParams,
) => {
  const updateMnemonicOnSubsystem = (value: any) => {
    //console.log(value)
    if (value.id === params.id) {
      return { ...value, ...params };
    }
  };
  const modifiedSubsystems = _.cloneDeepWith(
    currentContact.subsystems,
    updateMnemonicOnSubsystem,
  );
  return modifiedSubsystems;
};

export const findMnemonicById = (
  mnemonics: Array<Mnemonic>,
  id: string
): Mnemonic | undefined => {
  let found: Mnemonic | undefined = undefined
  // mnemonics.forEach((mnemonic) => {
  //   if (mnemonic.mnemonicId == id){
  //     found = mnemonic
  //   }
  // })
  // return found
  found = mnemonics.find(
    (mnemonic) => mnemonic.mnemonicId === id
  );
  //console.log(found)
  return found

}

// export const setMnemonicFromAPI = (
//   api_mnemonic: AITMnemonics
// ) => {
//   let transformMnemonic: Mnemonic = {
//     // id : crypto.randomUUID(),
//     // assembly_id: assembly_id,
//     // type : mnemonic.type,
//     // mnemonicId : name,
//     // status : "normal",
//     // unit : mnemonic.units || "unitless",
//     // thresholdMax : 100,
//     // thresholdMin : 0,
//     // currentValue : 0,
//     // subsystem : subsystem_name,
//     // childSubsystem : child_subsystem_name,
//     // assemblyDevice : assemblyDevices.name,
//     // measurement : mnemonic.desc || "measurement",
//     // contactRefId : contact_id,
//     // watched : false
//   }
// }