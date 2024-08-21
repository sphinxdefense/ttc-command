import { useState, useEffect } from "react";
import {
  RuxGlobalStatusBar,
  RuxClock,
  RuxPopUp,
  RuxIcon,
  RuxMenu,
  RuxMenuItem,
  RuxMonitoringIcon,
  RuxToastStack,
  RuxMenuItemDivider,
} from "@astrouxds/react";
import type { Status } from "../../Data";
import { addToast } from "../../utils";
import { useAppContext, ContextType } from "provider/useAppContext";
import "./GlobalStatusBar.css";

const GlobalStatusBar = ({ appName }: { appName: string }) => {
  const [status1, setStatus1] = useState<Status>("off");
  const [status2, setStatus2] = useState<Status>("standby");
  const [status3, setStatus3] = useState<Status>("normal");
  const [status4, setStatus4] = useState<Status>("caution");
  const [notifications1, setNotifications1] = useState(0);
  const [notifications2, setNotifications2] = useState(2);
  const [notifications3, setNotifications3] = useState(4);
  const {
    contact,
    toggleInvestigate,
    showInvestigate,
    lightTheme,
    toggleTheme,
  }: ContextType = useAppContext();

  const statusValuesArr = [
    "off",
    "caution",
    "critical",
    "normal",
    "serious",
    "standby",
  ];

  const notificationsArr = [12, 14, 23, 42, 6, 37, 25, 38, 9];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomStatus = Math.floor(Math.random() * statusValuesArr.length);
      const randomStatus2 = Math.floor(Math.random() * statusValuesArr.length);
      const randomStatus3 = Math.floor(Math.random() * statusValuesArr.length);
      const randomStatus4 = Math.floor(Math.random() * statusValuesArr.length);
      setStatus1(statusValuesArr[randomStatus] as Status);
      setStatus2(statusValuesArr[randomStatus2] as Status);
      setStatus3(statusValuesArr[randomStatus3] as Status);
      setStatus4(statusValuesArr[randomStatus4] as Status);

      const randomNumber = Math.floor(Math.random() * notificationsArr.length);
      const randomNumber2 = Math.floor(Math.random() * notificationsArr.length);
      const randomNumber3 = Math.floor(Math.random() * notificationsArr.length);
      setNotifications1(notificationsArr[randomNumber]);
      setNotifications2(notificationsArr[randomNumber2]);
      setNotifications3(notificationsArr[randomNumber3]);
    }, 12000);
    return () => clearInterval(interval);
  });

  function menuSelect(e: CustomEvent) {
    const { detail } = e;
    if (detail.href) return;
    if (detail.value === "themeToggle") {
      toggleTheme();
      document.body.classList.toggle("light-theme");
      return;
    }
    if (detail.value === "investigate") {
      toggleInvestigate();
      return;
    }
    addToast("This feature has not been implemented", false, 3000);
  }

  return (
    <>
      <RuxToastStack />
      <RuxGlobalStatusBar
        appDomain="TT&C"
        appName={appName}
        username="J. Smith"
        app-state="Demo"
        app-state-color="tag1"
      >
        <RuxPopUp
          className="app-icon-pop-up"
          placement="top-start"
          slot="left-side"
          closeOnSelect
        >
          <RuxIcon
            className="app-switcher-icon"
            slot="trigger"
            size="small"
            icon="apps"
          />
          <RuxMenu onRuxmenuselected={(e) => menuSelect(e)}>
            <RuxMenuItem value="investigate">
              TTC {showInvestigate ? "Command" : "Investigate"}
            </RuxMenuItem>
            <RuxMenuItem href="https://monitor-ttc.netlify.app/">
              TTC Monitor
            </RuxMenuItem>
            <RuxMenuItemDivider />
            <RuxMenuItem value="themeToggle">
              {lightTheme ? "Dark" : "Light"} Theme
            </RuxMenuItem>
            <RuxMenuItem>Preferences</RuxMenuItem>
            <RuxMenuItem>Sign Out</RuxMenuItem>
          </RuxMenu>
        </RuxPopUp>
        <div>
          <RuxClock
            aos={new Date(contact.aos).toISOString()}
            los={new Date(contact.los).toISOString()}
          />
        </div>

        <div className="status-indicators" slot="right-side">
          <RuxMonitoringIcon
            status={status1}
            icon="antenna-off"
            label="Lion-A"
            notifications={notifications1}
          />
          <RuxMonitoringIcon
            status={status2}
            icon="satellite-transmit"
            label="Iron 4090"
            notifications={notifications1}
          />
          <RuxMonitoringIcon
            status={status3}
            icon="antenna-receive"
            label="Comms"
            notifications={notifications2}
          />
          <RuxMonitoringIcon
            status={status4}
            icon="processor"
            label="Software"
            notifications={notifications3}
          />
        </div>
      </RuxGlobalStatusBar>
    </>
  );
};

export default GlobalStatusBar;
