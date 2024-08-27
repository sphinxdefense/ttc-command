import {
  RuxCheckbox,
  RuxIcon,
  RuxPopUp,
  RuxCard,
  RuxButton,
} from "@astrouxds/react";
import { useTTCGRMActions } from "../../../../../Data";
import type { Mnemonic } from "../../../../../Data";
import LineChart from "../../../Watcher/LineChart";
import { getRandomInt } from "utils";
import { useAppContext, ContextType } from "provider/useAppContext";
import "./MnemonicPopUp.css";
import { useMemo, useEffect, useState } from "react";

type PropTypes = {
  triggerValue: string | number;
  data: Mnemonic;
};

const MnemonicPopUp = ({ triggerValue, data }: PropTypes) => {
  const { modifyMnemonic } = useTTCGRMActions();
  const [menmonicData, setMenmonicData] = useState<Array<any>>([0]);

  const { toggleInvestigate, selectSubsystemsFromMnemonic }: ContextType =
    useAppContext();

  // const menmonicData = useMemo(
  //   () => [
  //     data.currentValue,
  //   ],
  //   [data.currentValue]
  // );

  useEffect(() => {
    setMenmonicData([...menmonicData,data.currentValue])

  }, [data.currentValue]);
  //console.log(menmonicData)

  const handleSubsystemPassPlanClick = () => {
    selectSubsystemsFromMnemonic(data);
    toggleInvestigate();
  };

  const handleWatched = () => {
    modifyMnemonic({ ...data, watched: !data.watched });
  };

  return (
    <RuxPopUp placement="right" strategy="fixed" className="mnemonic-pop-up">
      <RuxCard>
        <span slot="header">{data.mnemonicId}</span>
        {<LineChart chartData={menmonicData || [0]} />} 
        <div>
          <span>Value:</span>
          <span>
            {data.currentValue} {data.unit}
          </span>
        </div>
        <div>
          <span className="subsystem">Subsystem:</span>
          <RuxButton
            className="subsystem-button"
            size="small"
            borderless
            onClick={() => handleSubsystemPassPlanClick()}
          >
            {data.subsystem}
            <RuxIcon size="1rem" icon="launch" />
          </RuxButton>
        </div>
        <div slot="footer">
          <RuxCheckbox
            checked={data.watched}
            onRuxchange={() => handleWatched()}
          >
            Add to Watcher
          </RuxCheckbox>
        </div>
      </RuxCard>
      <span slot="trigger">{triggerValue}</span>
    </RuxPopUp>
  );
};

export default MnemonicPopUp;
