import { ContactsMap, AlertsMap, MnemonicsMap } from './index';

export type SubscribeOptions = {
  initial?: number;
  interval?: number;
  limit?: number;
};

export type Unsubscribe = () => void;

export type Status =
  | 'caution'
  | 'critical'
  | 'normal'
  | 'off'
  | 'serious'
  | 'standby';

export type RangeOptions =
  | number
  | { start: number; stop: number; step?: number };

export type BetweenOptions =
  | number
  | { min?: number; max?: number; precision?: number };

export type AlertsPercentage =
  | 0
  | 2
  | 3
  | 4
  | 5
  | 10
  | 12
  | 15
  | 20
  | 25
  | 34
  | 50;

export type Category = 'hardware' | 'software' | 'spacecraft';

export type DataType = 'contact' | 'alert' | 'mnemonic';

export type Store = {
  contacts: ContactsMap;
  alerts: AlertsMap;
  mnemonics: MnemonicsMap;
};

export type StructuredData<T> = {
  dataArray: T[];
  dataById: { [key: string]: T };
  dataIds: string[];
};

export type Priority = 'Low' | 'Medium' | 'High';

export type Mode = 'Full Automation' | 'Semi-Automation' | 'Manual';

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type GroundStations =
  | 'CTS'
  | 'DGS'
  | 'GTS'
  | 'TCS'
  | 'VTS'
  | 'NHS'
  | 'TTS'
  | 'HTS';

export type States = 'upcoming' | 'executing' | 'complete' | 'failed';
