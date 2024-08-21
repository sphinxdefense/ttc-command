import { ContactOptions, Contact } from '../../types';
import { generateContact } from './generate-contact';
import { useState } from 'react';

export const generateContacts = (
  length: number = 100,
  options?: ContactOptions,
) => Array.from({ length }, (_, i) => generateContact(i, options));


export const getContact = async () => {
  let rtrn: Array<Contact> = new Array();
  const fetchData = async () => {
    const [res1, res2] = await Promise.all([fetch('http://localhost:8000/v1/contact?contact_id=296017c1-2fa9-4e12-9ef2-56d73680feaa'), fetch('http://localhost:8001/missions')]);
    const contact =  await res1.json()
    const missions =  await res2.json()
    //console.log(contact)
    //console.log(missions)
    //return {}
    let contact_and_mission = {...contact,...missions[0][contact.name]}
    contact_and_mission.mnemonics = []
    return new Array(contact_and_mission)
  }    
  rtrn = await fetchData();
  //console.log(rtrn)
  return rtrn
}