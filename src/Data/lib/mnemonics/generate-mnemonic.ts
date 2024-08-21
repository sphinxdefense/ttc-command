import { faker } from '@faker-js/faker';

import dataOption from '../../data/options';
import { shuffle, evaluateStatus } from '../../utils';
import type { MnemonicOptions, Mnemonic } from '../../types/index';

export const generateMnemonic = (options?: MnemonicOptions): Mnemonic => {
  // Passed Options
  const thresholdMax = options?.thresholdMax || 100;
  const thresholdMin = options?.thresholdMin || 0;
  const deviation = options?.deviation || 10;
  const precision = options?.precision || 0.1;
  const subsystem = options?.subsystem || shuffle(dataOption.subsystems);
  const childSubsystem =
    options?.childSubsystem || shuffle(dataOption.childSubSystems);
  const assemblyDevice =
    options?.assemblyDevice || shuffle(dataOption.assemblyDevices);
  const seriousThresholdRange = options?.seriousThresholdRange || 5;
  const cautionThresholdRange = options?.cautionThresholdRange || 10;
  const contactRefId = options?.contactRefId || '';

  //Derived Values
  const id = faker.string.uuid();
  const mnemonicId = faker.string.alpha({ length: 7, casing: 'upper' });
  const childSubSystemNum = faker.number.int({ min: 1, max: 2 });
  const unit = shuffle(dataOption.units);
  const assembly = unit === 'Volts' ? 'Voltage Monitor' : `Heater Switch Power`;
  const measurement = `${childSubsystem} ${childSubSystemNum} ${assembly}`;
  const currentValue = faker.number.float({
    max: thresholdMax + deviation,
    min: thresholdMin - deviation,
    multipleOf: precision,
  });
  const status = evaluateStatus(
    currentValue,
    thresholdMin,
    thresholdMax,
    seriousThresholdRange,
    cautionThresholdRange,
  );

  return {
    id,
    type: 'mnemonic',
    mnemonicId,
    status,
    unit,
    thresholdMax,
    thresholdMin,
    currentValue,
    subsystem,
    childSubsystem,
    assemblyDevice,
    measurement,
    contactRefId,
    watched: false,
  };
};
