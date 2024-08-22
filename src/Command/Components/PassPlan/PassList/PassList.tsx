import { RuxTree } from "@astrouxds/react";
import SelectMenuListItem from "./SelectMenuListItem/SelectMenuListItem";
import "./PassList.css";
import MnemonicListItem from "./MnemonicListItem/MnemonicListItem";
import ExecutableListItem from "./ExecutableListItem/ExecutableListItem";
import { Mnemonic, Command } from "../../../../Data";
import { generateRandomNumberArray } from "utils";

type PropTypes = {
  commandList: Command[];
  //mnemonics: Mnemonic[];
};

const itemAmount: number = 8;

const numberArray1 = generateRandomNumberArray(3);

const numberArray2 = generateRandomNumberArray(2);

const PassList = ({ commandList }: PropTypes) => {
  return (
    <>
      <RuxTree className="pass-plan_tree-wrapper">
        {commandList.length > 0
          ? commandList.map((item, index) => {
              return (
                <ExecutableListItem
                  key={index}
                  stepNumber={itemAmount + index}
                  queueCommand={item.commandString}
                  mnemonics={item.mnemonics || []}
                />
              );
            })
          : null}
      </RuxTree>
    </>
  );
};

export default PassList;
