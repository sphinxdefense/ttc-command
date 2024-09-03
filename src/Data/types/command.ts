import { Mnemonic } from "./mnemonic"

export type Command = {
    commandString: string,
    description: string,
    commandId: number
    mnemonics: Map<string,Mnemonic>;
    args?: string[]
}
 
// type AITCommnadArgumentDefinition = {
//     bytes: number[]
//     desc: string
//     fixed: boolean
//     name: string
//     type: string
//     value: any
// }

// export type AITCommandDefinition = {
//     arguments: AITCommnadArgumentDefinition[]
//     desc: string
//     name: string
//     opcode: number
//     subsystem: string
// }

export type AITCommandDefinition = {
    commandString: string,
    description: string,
    commandId: number
    mnemonicIds: string []
}