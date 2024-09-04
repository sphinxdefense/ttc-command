import { generateContact } from '../lib/contacts/generate-contact';
import { generateContacts, getContact } from '../lib/contacts/generate-contacts';
import { generateAlert } from '../lib/alerts/generate-alert';
import { generateMnemonic } from '../lib/mnemonics/generate-mnemonic';
import type {
  Contact,
  ContactOptions,
  ContactsServiceOptions,
  ModifyContactParams,
  Unsubscribe,
  Alert,
  Mnemonic,
  Store,
  ModifyAlertParams,
  ContactsMap,
  AlertsMap,
  MnemonicsMap,
  AlertOptions,
  MnemonicOptions,
  StructuredData,
  AITMnemonics,
  //ModifyMnemonicParamsNoLookup,
  ModifyMnemonicParams,
  Subsystem,
  MnemonicIdMap,
  Command
} from '../types';
import * as _ from 'lodash';
import { updateSubsystemWithMnemonic} from '../utils';
//import { useAppContext } from "../../provider/useAppContext";

let buffer: AITMnemonics[] = new Array();
let lock: boolean = false;


const initialStore = {
  contacts: new Map(),
  alerts: new Map(),
  mnemonics: new Map(),
};
export class TTC_GRM_Service {
  private _data: Store = initialStore;
  private _subscribers: Set<Function> = new Set();
  private _contactOptions: ContactOptions = {};
  private _interval: number;
  private _intervalId?: NodeJS.Timeout = undefined;
  private _limit: number;
  private _tlm_skt: any = null;
  private _contact_id: string = '';


  constructor(options?: ContactsServiceOptions, api_contact_array: Array<Contact> = []) {    
    this.transformData = this.transformData.bind(this);
    this._tlm_skt = new WebSocket("http://localhost:8001/tlm/realtime")
    this._contactOptions = {
      alertsPercentage: options?.alertsPercentage,
      dateRef: options?.dateRef,
      daysRange: options?.daysRange,
      secondAlertPercentage: options?.secondAlertPercentage,
      subsystemOptions: options?.subsystemOptions,
    };
    this._interval = options?.interval || 0;
    this._limit = options?.limit || 200;
    if (api_contact_array.length > 0) {
      this._contact_id = api_contact_array[0].id //TODO: assume one contact for now
    }
    this._tlm_skt.addEventListener("message", (event: any) => {
      let api_mnemonic: AITMnemonics = JSON.parse(event.data);
      buffer.push(api_mnemonic)
      const currentContact = this._data.contacts.get(this._contact_id);
      if(currentContact){
        if(buffer.length > 1000){
          console.log("clearing buffer")
          buffer = []
          lock = false
        }
        if (buffer.length > 100 && !lock){
          lock = true
          while(buffer.length){
            
            let packet = buffer.pop()
            if (packet){
              let mnemonic: Mnemonic | null | undefined = null
              let modified_mnemonics: Mnemonic[] = []; 
            
              for (const [key, value] of Object.entries(packet.data)) {
                  if (currentContact.mnemonic_id_lookup){
                    mnemonic = currentContact.mnemonic_id_lookup.get(packet.packet + '_' + key)
                  }
                  if (mnemonic != null){
                    if (mnemonic.currentValue != value){
                      
                      let new_mnemonic: Mnemonic =  {
                        ...mnemonic,
                        currentValue: value
                      };
                      modified_mnemonics.push(new_mnemonic)
                    }
                  }
              }
              //console.log(modified_mnemonics.length)
              if (modified_mnemonics.length > 0){
                this.modifyMnemonicsNoLookup(
                  this._contact_id,
                  modified_mnemonics,
                  1,
                  Object.keys(packet.data).length
                )
              }
            }


          }
          lock = false
        }
      }
    });

    if (options?.initial && this._data.contacts.size === 0) {
      this._generateInitialData(options.initial,api_contact_array);
    }
    
  }

  private _generateInitialData = (initial: number, api_contact_array: Array<Contact> = []) => {
    let contactsArray = []
    let contactsArray_gen = generateContacts(initial, this._contactOptions);
    contactsArray = api_contact_array;
    contactsArray.forEach((contact: Contact) =>
      this._data.contacts.set(contact.id, contact),
    );
    this._publish();
  };

  private _publish = () => {
    const newAlerts = new Map();
    const newMnemonics = new Map();

    const allContacts = Array.from(this._data.contacts.values());
    const alertsArray = allContacts.flatMap((contact) => contact.alerts);
    alertsArray.forEach((alert) => newAlerts.set(alert.id, alert));
    const mnemonicsArray = allContacts.flatMap((contact) => Array.from(contact.mnemonic_id_lookup.values()));
    mnemonicsArray.forEach((mnemonic) =>
      newMnemonics.set(mnemonic.id, mnemonic),
    );

    this._data.contacts = structuredClone(this._data.contacts);
    this._data.alerts = newAlerts;
    this._data.mnemonics = newMnemonics;
    this._subscribers.forEach((callback) => {
      callback(this._data);
    });
  };
  public subscribe = (callback: (data: Store) => void): Unsubscribe => {
    // sets interval for adding contacts on first subscribe
    if (this._subscribers.size === 0) {
      this._intervalId = this._interval
        ? setInterval(this.addContact.bind(this), 1000 * this._interval)
        : undefined;
    }

    this._subscribers.add(callback);
    this._publish();

    return () => {
      this._subscribers.delete(callback);
      if (this._subscribers.size < 1) {
        clearInterval(this._intervalId);
      }
    };
  };
  public getSnapshot = (): Store => {
    return this._data;
  };

  public transformData(mappedData: ContactsMap): StructuredData<Contact>;
  public transformData(mappedData: AlertsMap): StructuredData<Alert>;
  public transformData(mappedData: MnemonicsMap): StructuredData<Mnemonic>;
  public transformData(mappedData: ContactsMap | AlertsMap | MnemonicsMap) {
    const firstValue: Contact | Alert | Mnemonic = [...mappedData.values()][0];
    if (!firstValue) {
      return {
        dataArray: [],
        dataById: {},
        dataIds: [],
      };
    }
    if (firstValue.type === 'contact') {
      return this._buildStructuredData<Contact>(mappedData);
    } else if (firstValue.type === 'alert') {
      return this._buildStructuredData<Alert>(mappedData);
    } else if (firstValue.type === 'mnemonic') {
      return this._buildStructuredData<Mnemonic>(mappedData);
    }
  }

  public addContact = (
    options: ContactOptions = this._contactOptions,
  ): Contact | void => {
    if (this._data.contacts.size >= this._limit) {
      console.info('contact limit reached');
      clearInterval(this._intervalId);
      return;
    }

    const index = this._data.contacts.size - 1;
    const addedContact = generateContact(index, options);
    this._data.contacts.set(addedContact.id, addedContact);
    this._publish();
    return addedContact;
  };
  public addAlert = (contactId: string, options?: AlertOptions): Alert => {
    const newAlert = generateAlert({ contactRefId: contactId, ...options });
    const currentContact = this._data.contacts.get(contactId);
    if (!currentContact)
      throw new Error(`Contact with id ${contactId} does not exist`);
    this.modifyContact({
      id: contactId,
      alerts: [...currentContact.alerts, newAlert],
    });
    return newAlert;
  };
  public addMnemonic = (
    contactId: string,
    options: MnemonicOptions,
  ): Mnemonic => {
    const newMnemonic = generateMnemonic({
      contactRefId: contactId,
      ...options,
    });
    const currentContact = this._data.contacts.get(contactId);
    if (!currentContact)
      throw new Error(`Contact with id ${contactId} does not exist`);
    currentContact.mnemonic_id_lookup.set(newMnemonic.id,newMnemonic)
    this.modifyContact({
      id: contactId,
      mnemonic_id_lookup: currentContact.mnemonic_id_lookup
    });
    return newMnemonic;
  };

  public modifyContact = (params: ModifyContactParams): Contact => {
    const currentContact = this._data.contacts.get(params.id);
    if (!currentContact)
      throw new Error(`Contact with id ${params.id} does not exist`);
    const modifiedContact = { ...currentContact, ...params };
    // if (params.subsystems) {
    //   modifiedContact.mnemonics = getSubsystemMnemonics(params.subsystems);
    // }

    this._data.contacts.set(params.id, modifiedContact);
    this._publish();
    return modifiedContact;
  };
  public modifyAlert = (params: ModifyAlertParams): Alert => {
    const currentContact = this._data.contacts.get(params.contactRefId);
    if (!currentContact)
      throw new Error(`Contact with id ${params.contactRefId} does not exist`);

    const currentAlert = currentContact?.alerts.find(
      (alert) => alert.id === params.id,
    );
    if (!currentAlert)
      throw new Error(`Alert with id ${params.id} does not exist`);

    const alertIndex = currentContact?.alerts.indexOf(currentAlert);
    const modifiedAlert = { ...currentAlert, ...params };
    currentContact.alerts.splice(alertIndex, 1, modifiedAlert);
    this._publish();
    return modifiedAlert;
  };

  public modifyMnemonicsNoLookup = (ref_id: string, update_mnemonics: Mnemonic[], frame_count?: number,mnemonic_count?: number, mod_val: number= Number.MAX_SAFE_INTEGER): void => {
    const currentContact = structuredClone(this._data.contacts.get(ref_id));
    if (!currentContact)
      throw new Error(`Contact with id ${ref_id} does not exist`);
    let subsystems: Subsystem[] = currentContact.subsystems
    let all_mnemonics_lookup: MnemonicIdMap | undefined = currentContact.mnemonic_id_lookup
    let commands: Command[] | undefined = currentContact.commands

    update_mnemonics.forEach((mnemonic) => {
      if(all_mnemonics_lookup){
        all_mnemonics_lookup.set(mnemonic.id, mnemonic)
      }
      subsystems.forEach((subsystem) => {
        subsystem.childSubsystems.forEach((childSubSystem) => {
          childSubSystem.assemblyDevices.forEach((assemblyDevice) => {
              if(assemblyDevice.mnemoicIdMap.get(mnemonic.id)){
                //console.log("update mnemonic")
                assemblyDevice.mnemoicIdMap.set(mnemonic.id,mnemonic)
              }
              
          })
        })
      })
      commands?.forEach((command) => {
        if(command.mnemonics.has(mnemonic.id)){
          command.mnemonics.set(mnemonic.id,mnemonic)
        }
      }) 
    })
    if (frame_count && mnemonic_count){
      this.modifyContact({
        id: currentContact.id,
        subsystems: subsystems,
        mnemonic_id_lookup: all_mnemonics_lookup,
        commands: commands,
        frame_count: ((currentContact.frame_count || 0) + frame_count) % mod_val,
        mnemonic_count: ((currentContact.mnemonic_count || 0) + mnemonic_count) & mod_val,
      });
    }
    else{
      this.modifyContact({
        id: currentContact.id,
        subsystems: subsystems,
        mnemonic_id_lookup: all_mnemonics_lookup
      });
    }


  };


  // public modifyMnemonicNoLookup = (update_mnemonic: Mnemonic): Contact => {
  //   const currentContact = this._data.contacts.get(update_mnemonic.contactRefId);
  //   if (!currentContact)
  //     throw new Error(`Contact with id ${update_mnemonic.contactRefId} does not exist`);
  //   //console.log(update_mnemonic.watched)
  //   const modifiedMnemonic = {
  //     ...update_mnemonic,
  //   };
  //   if (currentContact.mnemonic_id_lookup){
  //     currentContact.mnemonic_id_lookup[update_mnemonic.mnemonicId] = modifiedMnemonic
  //   }
  //   //currentContact?.mnemonic_id_lookup?[update_mnemonic.mnemonicId] =  modifiedMnemonic
   
  //   const modifiedSubsystems = updateSubsystemWithMnemonic(
  //     currentContact,
  //     modifiedMnemonic,
  //   );
  //   const modifiedContact = { 
  //     ...currentContact, 
  //     subsystems: modifiedSubsystems,
  //     mnemonic_id_lookup: currentContact.mnemonic_id_lookup
  //   };

  //   // this.modifyContact({
  //   //   id: currentContact.id,
  //   //   subsystems: modifiedSubsystems,
  //   // });
  //   return modifiedContact;
  // };


  public modifyMnemonic = (params: ModifyMnemonicParams): Mnemonic => {
    const currentContact = this._data.contacts.get(params.contactRefId);
    if (!currentContact)
      throw new Error(`Contact with id ${params.contactRefId} does not exist`);

    const currentMnemonic: Mnemonic | undefined = currentContact.mnemonic_id_lookup.get(params.id)
    if (!currentMnemonic)
      throw new Error(`Mnemonic with id ${params.id} does not exist`);

    const modifiedMnemonic = {
      ...currentMnemonic,
      ...params,
    };
    let all_mnemonics_lookup: MnemonicIdMap | undefined = structuredClone(currentContact.mnemonic_id_lookup)
    all_mnemonics_lookup.set(params.id,modifiedMnemonic)

    const modifiedSubsystems = updateSubsystemWithMnemonic(
      currentContact,
      params,
    );

    this.modifyContact({
      id: currentContact.id,
      subsystems: modifiedSubsystems,
      mnemonic_id_lookup: all_mnemonics_lookup,

    });
    return modifiedMnemonic;
  };




  public modifyAllContacts = (
    params: Omit<ModifyContactParams, 'id'>,
  ): string => {
    this._data.contacts.forEach((contact: Contact, contactId: string) => {
      const modifiedContact = { ...contact, ...params };
      // if (params.subsystems) {
      //   modifiedContact.mnemonics = getSubsystemMnemonics(params.subsystems);
      // }
      this._data.contacts.set(contactId, modifiedContact);
    });
    this._publish();
    return `Successfully modified all contacts`;
  };
  public modifyAllAlerts = (
    params: Omit<ModifyAlertParams, 'id' | 'contactRefId'>,
  ): string => {
    this._data.contacts.forEach((contact: Contact, contactId: string) => {
      const mappedAlerts = contact.alerts.map((alert) => {
        return { ...alert, ...params };
      });
      this._data.contacts.set(contactId, { ...contact, alerts: mappedAlerts });
    });
    this._publish();
    return `Successfully modified all alerts`;
  };
  public modifyAllMnemonics = (
    params: Omit<ModifyMnemonicParams, 'id' | 'contactRefId'>,
  ): string => {
    this._data.contacts.forEach((contact: Contact, contactId: string) => {
      const updateMnemonicOnSubsystem = (value: any) => {
        if (value.type === 'mnemonic') {
          return { ...value, ...params };
        }
      };

      const modifiedSubsystems = _.cloneDeepWith(
        contact.subsystems,
        updateMnemonicOnSubsystem,
      );
      this.modifyContact({ ...contact, subsystems: modifiedSubsystems });
    });
    return `Successfully modified all mnemonics`;
  };

  public deleteContact = (id: string): string => {
    this._data.contacts.delete(id);
    this._publish();
    return `Successfully deleted contact: ${id}`;
  };
  public deleteAlert = (contactRefId: string, alertId: string): string => {
    const currentContact = this._data.contacts.get(contactRefId);
    if (!currentContact)
      return `Contact with id ${contactRefId} does not exist`;
    const modifiedAlerts = currentContact.alerts.filter(
      (alert) => alert.id !== alertId,
    );

    this.modifyContact({ id: currentContact.id, alerts: modifiedAlerts });

    return `Successfully deleted alert: ${alertId}`;
  };
  public deleteMnemonic = (
    contactRefId: string,
    mnemonicId: string,
  ): string => {
    const currentContact = this._data.contacts.get(contactRefId);
    if (!currentContact)
      return `Contact with id ${contactRefId} does not exist`;
    let all_mnemonics_lookup: MnemonicIdMap | undefined = structuredClone(currentContact.mnemonic_id_lookup)
    // const modifiedMnemonics = currentContact.mnemonic_id_lookup.filter(
    //   (mnemonic) => mnemonic.id !== mnemonicId,
    // );
    all_mnemonics_lookup.delete(mnemonicId)

    this.modifyContact({ id: currentContact.id, mnemonic_id_lookup: all_mnemonics_lookup });

    return `Successfully deleted mnemonic: ${mnemonicId}`;
  };

  public deleteContactsWithProp = (
    property: keyof Contact,
    value: Contact[keyof Contact],
  ): string => {
    this._data.contacts.forEach((contact: Contact, contactId: string) => {
      if (contact[property] === value) this._data.contacts.delete(contactId);
    });
    this._publish();
    return `Successfully deleted all contacts with ${property} of ${value}`;
  };
  public deleteAlertsWithProp = (
    property: keyof Alert,
    value: Alert[keyof Alert],
  ): string => {
    const contacts = this._data.contacts;
    contacts.forEach((contact: Contact, contactId: string) => {
      const filteredAlerts = contact.alerts.filter(
        (alert) => alert[property] !== value,
      );
      contacts.set(contactId, {
        ...contact,
        alerts: filteredAlerts,
      });
    });
    this._publish();
    return `Successfully deleted all alerts with ${property} of ${value}`;
  };
  // public deleteMnemonicsWithProp = (
  //   property: keyof Mnemonic,
  //   value: Mnemonic[keyof Mnemonic],
  // ): string => {
  //   this._data.contacts.forEach((contact: Contact, contactId: string) => {
  //     const filteredMnemonics = contact.mnemonics.filter(
  //       (mnemonic) => mnemonic[property] !== value,
  //     );
  //     this._data.contacts.set(contactId, {
  //       ...contact,
  //       mnemonics: filteredMnemonics,
  //     });
  //   });
  //   this._publish();
  //   return `Successfully deleted all mnemonics with ${property} of ${value}`;
  // };

  public allContactsHaveProp = (
    property: keyof Contact,
    value: Contact[keyof Contact],
  ): boolean => {
    const { dataArray } = this.transformData(this._data.contacts);
    return dataArray.every((data) => data[property] === value);
  };
  public allAlertsHaveProp = (
    property: keyof Alert,
    value: Alert[keyof Alert],
  ): boolean => {
    const { dataArray } = this.transformData(this._data.alerts);
    return dataArray.every((data) => data[property] === value);
  };
  public allMnemonicsHaveProp = (
    property: keyof Mnemonic,
    value: Mnemonic[keyof Mnemonic],
  ): boolean => {
    const { dataArray } = this.transformData(this._data.mnemonics);
    return dataArray.every((data) => data[property] === value);
  };

  public anyContactsHaveProp = (
    property: keyof Contact,
    value: Contact[keyof Contact],
  ): boolean => {
    const { dataArray } = this.transformData(this._data.contacts);
    return dataArray.some((data) => data[property] === value);
  };
  public anyAlertsHaveProp = (
    property: keyof Alert,
    value: Alert[keyof Alert],
  ): boolean => {
    const { dataArray } = this.transformData(this._data.alerts);
    return dataArray.some((data) => data[property] === value);
  };
  public anyMnemonicsHaveProp = (
    property: keyof Mnemonic,
    value: Mnemonic[keyof Mnemonic],
  ): boolean => {
    const { dataArray } = this.transformData(this._data.mnemonics);
    return dataArray.some((data) => data[property] === value);
  };

  private _buildStructuredData = <T>(
    mappedData: ContactsMap | AlertsMap | MnemonicsMap,
  ) => {
    const dataArray = [...mappedData.values()] as T[];
    const dataById = Object.fromEntries(mappedData.entries()) as {
      [key: string]: T;
    };
    const dataIds = [...mappedData.keys()] as string[];
    return { dataArray, dataById, dataIds };
  };
}
