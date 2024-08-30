import { RuxButton, RuxProgress, RuxIcon, RuxTreeNode, RuxInput } from "@astrouxds/react";
import { useEffect, useMemo, useState } from "react";
import MnemonicListItem from "../MnemonicListItem/MnemonicListItem";
import { generateRandomNumberArray, getRandomInt } from "../../../../../utils";
import { Mnemonic,Command } from "../../../../../Data";
import { useAppContext, ContextType } from "provider/useAppContext";
import { ar } from "@faker-js/faker";

type PropTypes = {
  stepNumber: number | string;
  queueCommand: Command;
};

type InputMap = { [key: number]: any }

const ExecutableListItem = ({
  stepNumber,
  queueCommand,
}: PropTypes) => {
  const [value, setValue] = useState<number>(0);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [firstClick, setFirstClick] = useState<boolean>(false);
  const [argMap, setArgMap] = useState<InputMap>({})
  const timeout: number = 20
  const progressComplete: boolean = value >= 100;
  const numberArray = useMemo(() => {
    return generateRandomNumberArray(getRandomInt(2, 5));
  }, []);
  // const tmpMap: InputMap = {}
  // queueCommand.args?.map((item, index) => {
  //   tmpMap[index] = 0
  // })
  // setArgMap(tmpMap)

  const { contact }: ContextType = useAppContext();
  useEffect(() => {
    let interval: any;
    if (inProgress) {
      interval = setInterval(() => {
        setValue((prevValue) => {
          if (prevValue >= 100) {
            clearInterval(interval);
          }
          return prevValue + 1;
        });
      }, 1000 / timeout);
    } else {
      if (!firstClick){
        clearInterval(interval);
        setFirstClick(true)
      }
      else{
        setValue(100)
      }
    }

    return () => clearInterval(interval);
  }, [inProgress]);

  const handleExecuteButtonClick = () => {
    setInProgress(true);
    const data = new FormData();
    document.cookie = `sid=${contact.cookie}`
    //console.log(argMap)
    let com_str = queueCommand.commandString + " " + Array.from(Object.values(argMap)).join(' ')
    data.append("command", com_str);
    fetch('http://localhost:8001/cmd', {  // FIXME: hardcoded url and CORS
      method: 'POST',
      credentials: 'include',
      body: data
    }).catch((err) => {}).then(res => setInProgress(false)).catch((err) => {})
  };

  const setInputValue = (idx:number,value:any) => {
    let updateField: InputMap = {}
    updateField[idx] = value
    setArgMap({...argMap,...updateField})

  }

  return (
    <RuxTreeNode expanded>
      <div slot="prefix" className="pass-plan_number-wrapper">
        {stepNumber}
      </div>
      <div className="pass-plan_executable-wrapper">
        {!progressComplete ? (
          <RuxButton
            iconOnly
            icon={inProgress ? "pause" : "play-arrow"}
            onClick={handleExecuteButtonClick}
          />
        ) : (
          <RuxIcon icon="check-circle-outline" size="small" />
        )}

        <div className="pass-plan_executable-progress-wrapper">
          <div className="pass-plan_command-name">{queueCommand.commandString}</div>
          {queueCommand.args?.map((item, index) => (
            <div className="pass-plan_progress-time">
              <RuxInput
                type="text"
                placeholder={item}
                onRuxinput={(e) => {
                  setInputValue(index,e.target.value);
                }}
              />
            </div>
          ))}
          <div className="pass-plan_progress-time">
            <RuxProgress value={value} hideLabel />
            <RuxIcon icon="schedule" size="extra-small" />
            {`00:00:${timeout}`}
          </div>
        </div>
      </div>
      {queueCommand.mnemonics?.map((item, index) => (
        <MnemonicListItem
          key={index}
          stepNumber={`${stepNumber}.${index + 1}`}
          slotNode={true}
          mnemonic={item}
        />
      ))}
    </RuxTreeNode>
  );
};

export default ExecutableListItem;
