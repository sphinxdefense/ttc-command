import { ChildSubsystem } from '../../types/subsystems';
import dataOption from '../../data/options';
import { generateChildSubsystem } from './generate-child-subsystem';
import type { SubsystemOptions } from '../../types/index';

export const generateChildSubsystems = (
  contactRefId: string,
  subsystemName: string,
  subsystemOptions?: SubsystemOptions,
): ChildSubsystem[] => {
  const childSubsystemArray = Array.from(
    { length: dataOption.childSubSystems.length },
    () => generateChildSubsystem(contactRefId, subsystemName, subsystemOptions),
  );

  return childSubsystemArray.filter(
    (value, index, self) =>
      self.findIndex((v) => v.name === value.name) === index,
  );
};
