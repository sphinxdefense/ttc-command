import { Alert } from './alert';
import { Mnemonic } from './mnemonic';
import { Subsystem } from './subsystems';
import {
  AlertsPercentage,
  Status,
  SubscribeOptions,
  DataType,
  Priority,
  Mode,
  AtLeast,
} from './util';
import type { SubsystemOptions } from './subsystems';
import type { Command } from '../types';

export type ContactsMap = Map<string, Contact>;

export type ContactOptions = {
  alertsPercentage?: AlertsPercentage;
  secondAlertPercentage?: AlertsPercentage;
  daysRange?: number;
  dateRef?: string | number | Date;
  subsystemOptions?: SubsystemOptions;
};

export type ContactsServiceOptions = ContactOptions & SubscribeOptions;
export type OnContactChangeOptions = ContactOptions & SubscribeOptions;

export type Contact = {
  id: string;
  type: DataType;
  priority: Priority;
  status: Status;
  name: number;
  ground: string;
  rev: number;
  satellite: string;
  equipment: string;
  subsystems: Subsystem[];
  state: string;
  step: string;
  detail: string;
  beginTimestamp: number;
  endTimestamp: number;
  aos: number;
  los: number;
  dayOfYear: number;
  latitude: number;
  longitude: number;
  azimuth: number;
  elevation: number;
  resolution: string;
  resolutionStatus: string;
  mode: Mode;
  selected: boolean;
  alerts: Alert[];
  mnemonic_id_lookup: Map<string,Mnemonic>;
  commands?: Command[]
  cookie?: number | string;
  frame_count?: number;
  mnemonic_count?: number;
};

export type ModifyContactParams = AtLeast<Contact, 'id'>;

export type UpdateContactParams = {
  ground?: string;
  satellite?: string;
  equipment?: string;
  state?: string;
  step?: string;
  detail?: string;
  beginTimestamp?: number;
  endTimestamp?: number;
  resolution?: string;
  resolutionStatus?: string;
  priority?: Priority;
  mode?: Mode;
};
