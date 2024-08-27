import { Status, MnemonicOptions } from './index';
import type { MnemonicIdMap } from '../types';

export type Subsystem = {
  name: string;
  status: Status;
  childSubsystems: ChildSubsystem[];
};

export type ChildSubsystem = {
  name: string;
  status: Status;
  subsystemParent: string;
  assemblyDevices: AssemblyDevice[];
};

export type AssemblyDevice = {
  name: string;
  status: Status;
  childSubsystemParent: string;
  mnemoicIdMap: MnemonicIdMap;
  label: string;
};

export type AssemblyDeviceOptions = {
  mnemonicsPerAssemblyDevice?: number;
};

export type SubsystemOptions = {
  desiredSubsystems?: string[];
  assemblyDeviceOptions?: AssemblyDeviceOptions;
  mnemonicOptions?: MnemonicOptions;
};
