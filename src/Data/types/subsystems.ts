import { Status, Mnemonic, MnemonicOptions } from './index';

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
  mnemonics: Mnemonic[];
};

export type AssemblyDeviceOptions = {
  mnemonicsPerAssemblyDevice?: number;
};

export type SubsystemOptions = {
  desiredSubsystems?: string[];
  assemblyDeviceOptions?: AssemblyDeviceOptions;
  mnemonicOptions?: MnemonicOptions;
};
