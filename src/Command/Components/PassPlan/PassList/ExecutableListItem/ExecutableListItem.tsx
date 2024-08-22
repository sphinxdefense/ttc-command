import { RuxButton, RuxProgress, RuxIcon, RuxTreeNode } from "@astrouxds/react";
import { useEffect, useMemo, useState } from "react";
import MnemonicListItem from "../MnemonicListItem/MnemonicListItem";
import { generateRandomNumberArray, getRandomInt } from "../../../../../utils";
import { Mnemonic } from "../../../../../Data";
import { useAppContext, ContextType } from "provider/useAppContext";

type PropTypes = {
  stepNumber: number | string;
  queueCommand: string;
  mnemonics: Mnemonic[];
};

const ExecutableListItem = ({
  stepNumber,
  queueCommand,
  mnemonics,
}: PropTypes) => {
  const [value, setValue] = useState<number>(0);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const progressComplete: boolean = value >= 100;
  const numberArray = useMemo(() => {
    return generateRandomNumberArray(getRandomInt(2, 5));
  }, []);

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
      }, 50);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [inProgress]);

  const handleExecuteButtonClick = () => {
    setInProgress((prevState) => !prevState);
    const data = new FormData();
    document.cookie = `sid=${contact.cookie}`
    console.log(contact.cookie)
    data.append("command", queueCommand);
    console.log(data)
    fetch('http://localhost:8001/cmd', {
      method: 'POST',
      credentials: 'include',
      body: data
    }).catch((err) => {}).then(res => setInProgress((prevState) => !prevState)).catch((err) => {})
  };

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
          <div className="pass-plan_command-name">{queueCommand}</div>
          <div className="pass-plan_progress-time">
            <RuxProgress value={value} hideLabel />
            <RuxIcon icon="schedule" size="extra-small" />
            00:00:25
          </div>
        </div>
      </div>
      {mnemonics.map((item, index) => (
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
