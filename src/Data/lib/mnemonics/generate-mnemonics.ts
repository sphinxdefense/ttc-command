import { MnemonicOptions } from '../../types';
import { generateMnemonic } from './generate-mnemonic';

export const generateMnemonics = (
  length: number = 9,
  options?: MnemonicOptions,
) => Array.from({ length }, () => generateMnemonic(options));
