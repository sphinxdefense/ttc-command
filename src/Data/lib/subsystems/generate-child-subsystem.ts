import { ChildSubsystem, SubsystemOptions } from '../../types/subsystems';
import dataOption from '../../data/options';
import { shuffle, getMostSevereStatus } from '../../utils';
import { generateAssemblyDevices } from './generate-assembly-devices';

export const generateChildSubsystem = (
  contactRefId: string,
  subsystem: string,
  subsystemOptions?: SubsystemOptions,
): ChildSubsystem => {
  const name = shuffle(dataOption.childSubSystems);
  const assemblyDevices = generateAssemblyDevices(
    contactRefId,
    subsystem,
    name,
    subsystemOptions,
  );
  const status = getMostSevereStatus(assemblyDevices);

  return {
    name,
    status: status,
    subsystemParent: subsystem,
    assemblyDevices: assemblyDevices,
  };
};
