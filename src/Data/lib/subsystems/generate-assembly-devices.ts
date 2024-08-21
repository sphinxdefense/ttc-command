import dataOption from '../../data/options';
import type { AssemblyDevice, SubsystemOptions } from '../../types/index';
import { generateAssemblyDevice } from './generate-assembly-device';

export const generateAssemblyDevices = (
  contactRefId: string,
  subsystem: string,
  childSubsystem: string,
  subsystemOptions?: SubsystemOptions,
): AssemblyDevice[] => {
  const assemblyDeviceArray = Array.from(
    { length: dataOption.assemblyDevices.length },
    () =>
      generateAssemblyDevice(
        contactRefId,
        subsystem,
        childSubsystem,
        subsystemOptions,
      ),
  );

  return assemblyDeviceArray.filter(
    (value, index, self) =>
      self.findIndex((v) => v.name === value.name) === index,
  );
};
