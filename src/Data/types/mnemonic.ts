import { Status, DataType, AtLeast } from './util';

export type MnemonicsMap = Map<string, Mnemonic>;

export type MnemonicOptions = {
  contactRefId?: string;
  thresholdMin?: number;
  thresholdMax?: number;
  deviation?: number;
  precision?: number;
  subsystem?: string;
  childSubsystem?: string;
  assemblyDevice?: string;
  seriousThresholdRange?: number;
  cautionThresholdRange?: number;
};

export type Mnemonic = {
  id: string;
  type: DataType;
  mnemonicId: string;
  status: Status;
  unit: string;
  thresholdMax: number;
  thresholdMin: number;
  currentValue: any;
  subsystem: string;
  childSubsystem: string;
  assemblyDevice: string;
  measurement: string;
  contactRefId: string;
  watched: boolean;
  assembly_id?: string
};

export type AITMnemonicDefinition = {
  name: string;
  type: DataType;
  desc: string;
  bytes: Array<number>;
  mask: number;
  units:string;
};

export type AITMnemonics = {
  packet: string;
  counter: number;
  data: Map<string,any>;
  delta: Map<any,any>;
  dntoeus: Map<any,any>;
};

export type ModifyMnemonicParams = AtLeast<Mnemonic, 'id' | 'contactRefId'>;
export type ModifyMnemonicParamsNoLookup = Mnemonic;

export type MnemonicIdMap = Map<string,Mnemonic>