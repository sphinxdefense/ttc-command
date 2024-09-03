import { RuxContainer, RuxOption, RuxSelect } from "@astrouxds/react";
import "./PassPlan.css";
//import commands from "../../../utils/commands.json";
import SearchCommands from "./SearchCommands/SearchCommands";
import { useEffect, useState } from "react";
import PrePassList from "./PrePassList/PrePassList";
import PassList from "./PassList/PassList";
import { useAppContext, ContextType } from "provider/useAppContext";
import PrePassComplete from "./PrePassComplete/PrePassComplete";
import { Command, Mnemonic } from "../../../Data";
import { RuxSelectCustomEvent } from "@astrouxds/astro-web-components";
import { addToast } from "utils";

const PassPlan = () => {
  const [command, setCommand] = useState<object>({});
  const [pass, setPass] = useState<string>("Pass");
  const [commandList, setCommandList] = useState<Command[]>([]);
  const [countdown, setCountdown] = useState<number>(4);
  const { contact }: ContextType = useAppContext();
  const passPlanMnemonics: Mnemonic[] = Array.from(contact.mnemonic_id_lookup.values()).slice(0, 100);
  let countdownFormat: string = `00:00:0${countdown}`;
  
  const addToPassQueue = (commandListItem: {
    commandId: number;
    commandString: string;
    description: string;
    mnemonics: Map<string,Mnemonic>
  }) => {
    if (!commandListItem) return;
    //console.log(commandList,commandListItem.commandString)
    setCommandList([...commandList, commandListItem]);
  };

  const handlePassModeSelect = (e: RuxSelectCustomEvent<void>) => {
    if (e.target.value === 'automatic') {
      addToast('Feature not implemented.', false, 800);
      e.target.value = "semi-auto"
    }
  }

  useEffect(() => {
    let interval: any;
    if (pass === "Pre-Pass-Complete" && countdown >= 1) {
      interval = setInterval(() => {
        setCountdown((prevValue) => {
          if (prevValue <= 0) {
            clearInterval(interval);
            setPass("Pass");
          }
          return prevValue - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pass]);
  return (
    <RuxContainer className="pass-plan">
      <div slot="header" className="pass-plan_header">
        <span>{contact.satellite} PASS PLAN</span>
        <RuxSelect
          className="pass-plan_header-select"
          size="small"
          label="Mode"
          disabled={ pass !== "Pass" ? true : false }
          value={ pass !== "Pass" ? "automatic" : "semi-auto" }
          onRuxchange={(e) => handlePassModeSelect(e)}
        >
          <RuxOption label="Automatic" value="automatic" />
          <RuxOption label="Semi-Auto" value="semi-auto" />
        </RuxSelect>
      </div>
      <div className={`pass-plan_banner ${pass}`}>
        {pass === "Pre-Pass-Complete"
          ? `${pass}. Pass starts in ${countdownFormat}`
          : pass}
      </div>
      <div className="pass-plan_header-wrapper">
        <div className="pass-plan_header-step">Step</div>
        <div className="pass-plan_header-instruction">Instruction</div>
      </div>
      {pass === "Pre-Pass" ? (
        <PrePassList setPass={setPass} />
      ) : pass === "Pre-Pass-Complete" ? (
        <PrePassComplete />
      ) : (
        <PassList commandList={commandList} />
      )}
      <div slot="footer">
        <SearchCommands
          commands={contact.commands || []}
          setCommand={setCommand}
          command={command}
          addToPassQueue={addToPassQueue}
          pass={pass}
        />
      </div>
    </RuxContainer>
  );
};

export default PassPlan;
