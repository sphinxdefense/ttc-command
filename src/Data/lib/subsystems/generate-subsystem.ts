import { Subsystem } from '../../types/subsystems';
import dataOption from '../../data/options';
import { shuffle } from '../../utils';
import { generateChildSubsystems } from './generate-child-subsystems';
import { getMostSevereStatus } from '../../utils';
import type { SubsystemOptions } from '../../types/index';

export const generateSubsystem = (
  contactRefId: string,
  subsystemName: string,
  subsystemOptions?: SubsystemOptions,
): Subsystem => {
  const childSubsystems = generateChildSubsystems(
    contactRefId,
    subsystemName,
    subsystemOptions,
  );
  const status = getMostSevereStatus(childSubsystems);

  return {
    name: subsystemName,
    status: status,
    childSubsystems: childSubsystems,
  };
};
