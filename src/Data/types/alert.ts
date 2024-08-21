import { Status, Category, DataType, AtLeast } from './util';

export type AlertsMap = Map<string, Alert>;

export type AlertOptions = {
  contactRefId?: string;
  equipment?: string;
  start?: string | number | Date;
  end?: string | number | Date;
  createdRef?: string | number | Date;
};

export type Alert = {
  id: string;
  type: DataType;
  status: Status;
  category: Category;
  message: string;
  longMessage: string;
  timestamp: number;
  selected: boolean;
  new: boolean;
  expanded: boolean;
  acknowledged: boolean;
  contactRefId: string;
};

export type ModifyAlertParams = AtLeast<Alert, 'id' | 'contactRefId'>;
