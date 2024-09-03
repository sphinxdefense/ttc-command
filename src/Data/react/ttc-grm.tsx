import {
  createContext,
  ReactNode,
  useContext,
  useSyncExternalStore,
} from 'react';

import type { ContactsServiceOptions, Contact, Mnemonic, Subsystem, ChildSubsystem, AITMnemonicDefinition, MnemonicIdMap, Command, AITCommandDefinition  } from '../types';
//import type {DataType} from "../types/util"
import { TTC_GRM_Service } from '../services/ttc-grm-service';
import { useState, useEffect } from 'react';
//import useWebSocket from "react-use-websocket"

const TTCGRMContext = createContext(
  new TTC_GRM_Service({ initial: 0, limit: 0 }),
);

export const useTTCGRMActions = () => useContext(TTCGRMContext);

export type TTCGRMProviderProps = {
  children: ReactNode;
  options: ContactsServiceOptions;
};

type AITChildSubsystem = {
  name: string;
  uid: number;
  fields: AITFields;

};

type AITFields = Map<string, AITMnemonicDefinition>;




export const TTCGRMProvider = ({ children, options }: TTCGRMProviderProps) => {
  const [provier, setProvider] = useState(<div></div>)
  useEffect(() => {
    const ContactSetup = async () => {
      const [api_contact, api_mission,api_tlm,api_cookie] = await Promise.all([
                                              fetch('http://localhost:8001/contact'), // FIXME: hard coded contact id for now
                                              fetch('http://localhost:8001/missions'),
                                              fetch('http://localhost:8001/tlm/dict'),
                                              fetch('http://localhost:8001/')
                                              //fetch('http://localhost:8001/cmd/dict'),
                                              // fetch('http://localhost:8001/limits/dict'),
                                              ]);
      const contact =  await api_contact.json()
      const missions =  await api_mission.json()
      //const limits =  await api_limits.json()
      const cookie = await api_cookie.json()
      const tlm =  await api_tlm.json()

      document.cookie = `sid=${cookie}`
      let contact_and_mission = {...contact,...missions[0][contact.satellite]}
      contact_and_mission.cookie = cookie
      let AITCommandDefinitions: AITCommandDefinition[] = missions[0][contact.satellite].commands
      let contact_id = contact_and_mission.id;

      const mnemonicsIdMap: MnemonicIdMap = new Map();
      contact_and_mission.subsystems.forEach((subsystem: Subsystem) => {
        let subsystem_name = subsystem.name;
        subsystem.childSubsystems.forEach((childSubsystem: ChildSubsystem) => {
          let child_subsystem_name = childSubsystem.name;
          childSubsystem.assemblyDevices.forEach((assemblyDevices) => {
            const assemblyMnemonicsIdMap: MnemonicIdMap = new Map();
            let assemblyName = child_subsystem_name + "_" + assemblyDevices.name
            const assemblyTlm: AITChildSubsystem =  tlm[assemblyName]
            let assembly_id = assemblyTlm.uid.toString()
            let name: string;
            let mnemonic: AITMnemonicDefinition;
            for ([name, mnemonic] of Object.entries(assemblyTlm.fields)) {
              let transformMnemonic: Mnemonic = {
                id : assemblyName + "_" + name,
                assembly_id: assembly_id,
                type : mnemonic.type,
                mnemonicId : name,
                status : "normal",
                unit : mnemonic.units || "unitless",
                thresholdMax : 100,
                thresholdMin : 0,
                currentValue : 0,
                subsystem : subsystem_name,
                childSubsystem : child_subsystem_name,
                assemblyDevice : assemblyDevices.name,
                measurement : mnemonic.desc || "measurement",
                contactRefId : contact_id,
                watched : false
              }
              mnemonicsIdMap.set(assemblyName + "_" + name,transformMnemonic)
              assemblyMnemonicsIdMap.set(assemblyName + "_" + name, transformMnemonic)
            }
            assemblyDevices.mnemoicIdMap = assemblyMnemonicsIdMap
          })
        });
      });
      const commands: Command[] = [];
      AITCommandDefinitions.forEach((commandDef) => {
        commands.push({...commandDef,mnemonics: new Map()})
        commandDef.mnemonicIds.forEach((mnemonicId) => {
          let mnemonic = mnemonicsIdMap.get(mnemonicId)
          if (mnemonic)
            commands.at(-1)?.mnemonics.set(mnemonicId,mnemonic)
        })
      })

      contact_and_mission.commands = commands
      contact_and_mission.mnemonic_id_lookup = mnemonicsIdMap
      contact_and_mission.alerts = []
      //console.log(contact_and_mission)
      return new Array(contact_and_mission)
    }   
    ContactSetup().then((contact_and_mission: Array<Contact>) => {
      const contactsService = new TTC_GRM_Service(options,contact_and_mission);
      setProvider((
        <TTCGRMContext.Provider value={contactsService}>
          {children}
        </TTCGRMContext.Provider>
      ));
    })
  }, []);
  return provier
};

export const useTTCGRMAlerts = () => {
  const { subscribe, getSnapshot, transformData } = useTTCGRMActions();
  const selectedData = useSyncExternalStore(
    subscribe,
    () => getSnapshot().alerts,
  );
  const transformedData = transformData(selectedData);
  if (!transformedData) throw new Error('invalid data type selected');
  return transformedData;
};

export const useTTCGRMContacts = () => {
  const { subscribe, getSnapshot, transformData } = useTTCGRMActions();
  const selectedData = useSyncExternalStore(
    subscribe,
    () => getSnapshot().contacts,
  );
  const transformedData = transformData(selectedData);
  if (!transformedData) throw new Error('invalid data type selected');
  return transformedData;
};

export const useTTCGRMMnemonics = () => {
  const { subscribe, getSnapshot, transformData } = useTTCGRMActions();
  const selectedData = useSyncExternalStore(
    subscribe,
    () => getSnapshot().mnemonics,
  );
  const transformedData = transformData(selectedData);
  if (!transformedData) throw new Error('invalid data type selected');
  return transformedData;
};
