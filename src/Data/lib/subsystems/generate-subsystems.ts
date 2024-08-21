import { Subsystem, SubsystemOptions } from '../../types/subsystems';
import dataOption from '../../data/options';
import { generateSubsystem } from './generate-subsystem';
import { shuffle } from '../../utils';

export const generateSubsystems = (
  contactRefId: string,
  subsystemOptions?: SubsystemOptions,
): Subsystem[] => {
  const { desiredSubsystems } = subsystemOptions || {};
  if (desiredSubsystems) {
    return desiredSubsystems.map((subSystemString) =>
      generateSubsystem(contactRefId, subSystemString, subsystemOptions),
    );
  } else {
    //generate random subsystems
    const subsystemName = shuffle(dataOption.subsystems);
    const subsystemArray = Array.from(
      { length: dataOption.subsystems.length },
      () => generateSubsystem(contactRefId, subsystemName, subsystemOptions),
    );

    return subsystemArray.filter(
      (value, index, self) =>
        self.findIndex((v) => v.name === value.name) === index,
    );
  }
};
