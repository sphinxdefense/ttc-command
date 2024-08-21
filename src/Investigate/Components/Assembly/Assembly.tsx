import { RuxContainer, RuxButton } from "@astrouxds/react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape, { Core } from "cytoscape";
import { cytoscapeTheme } from "./CytoScapeStyles";
import dagre, { DagreLayoutOptions } from "cytoscape-dagre";
import { useAppContext, ContextType } from "../../../provider/useAppContext";
import { useEffect, useState } from "react";
import { getRandomInt } from "utils";
import type { AssemblyDevice } from "../../../Data";

cytoscape.use(dagre);
const layout: DagreLayoutOptions = {
  name: "dagre",
  rankDir: "LR",
  nodeDimensionsIncludeLabels: true,
  spacingFactor: 1.2,
};

type ChildSubsystemNoMnemonics = {
  name: string;
  status: string;
  subsystemParent: string;
  assemblyDevices: Omit<AssemblyDevice, "mnemonics">[];
};

const Assembly = () => {
  const {
    selectAssemblyDevice,
    selectedChildSubsystem,
    selectedAssemblyDeviceName,
    lightTheme,
  }: ContextType = useAppContext();
  const [childSubsystem, setChildSubsystem] =
    useState<ChildSubsystemNoMnemonics | null>(null);
  const [cy, setCy] = useState<Core | null>(null);
  const [cyElements, setCyElements] = useState<any[]>([]);
  const theme = cytoscapeTheme(lightTheme);

  const childSubsytemWithoutMnemonics = selectedChildSubsystem
    ? {
        ...selectedChildSubsystem,
        assemblyDevices: [
          ...selectedChildSubsystem.assemblyDevices.map((device) => ({
            name: device.name,
            status: device.status,
            childSubsystemParent: device.childSubsystemParent,
          })),
        ],
      }
    : null;

  resize();

  //compare our subsystem to our stored array, if different set the new array
  if (
    JSON.stringify(childSubsystem) !==
      JSON.stringify(childSubsytemWithoutMnemonics) &&
    cy
  ) {
    setChildSubsystem(childSubsytemWithoutMnemonics);

    const elements = childSubsytemWithoutMnemonics
      ? childSubsytemWithoutMnemonics.assemblyDevices.map(
          ({ name, status }, index) => ({
            data: {
              id: index,
              label: name,
              status: status,
            },
          })
        )
      : [];

    const randomEdges = (elements: any[]) => {
      let edgesArray: any[] = [];
      elements.forEach((_, index) => {
        //we don't need the last element to have outgoing edges
        if (index === elements.length - 1) return;

        //generate number of lines either up to 2 or 1 for the penultimate node
        const numberEdges =
          index === elements.length - 2 ? 1 : getRandomInt(3, 1);
        //for each edge make it connect forward in the array
        for (let i = 1; i <= numberEdges; i++) {
          const edge = {
            data: {
              source: index,
              target: index + i,
            },
          };
          edgesArray.push(edge);
        }
      });
      return edgesArray;
    };
    setCyElements([...elements, ...randomEdges(elements)]);
  }

  function resize() {
    if (!cy) return;
    cy.layout(layout).run();
    cy.center();
    cy.resize();
  }

  const findAssemblyDeviceByName = (name: string) =>
    selectedChildSubsystem!.assemblyDevices.find(
      (device) => device?.name === name
    );

  const handleClick = (e: any) => {
    const data =
      e.target.nodeName === "RUX-BUTTON"
        ? e.target.textContent
        : e.target.data("label");
    const assemblyDevice = findAssemblyDeviceByName(data);
    if (!assemblyDevice) return;
    selectAssemblyDevice(assemblyDevice);
  };

  useEffect(() => {
    if (selectedAssemblyDeviceName && cy) {
      cy.nodes().deselect();
      cy.$(`node[label="${selectedAssemblyDeviceName}"]`).select();
    }
  }, [selectedAssemblyDeviceName, cy]);

  useEffect(() => {
    if (!cy) return;

    cy.container()!.classList.add("cytoscape-container");
    cy.on("click", "node", handleClick);
    cy.on("mouseout", "node", function (e: any) {
      e.target.removeClass("hover");
      cy.container()!.style.cursor = "initial";
    });
    cy.on("mouseover", "node", function (e: any) {
      e.target.addClass("hover");
      cy.container()!.style.cursor = "pointer";
    });
    cy.on("resize", function () {
      cy.fit();
    });

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  });

  return (
    <RuxContainer className="star-tracker">
      <div slot="header">{selectedChildSubsystem?.name}</div>
      {!(navigator.userAgent.indexOf("Firefox") > -1) ? (
        <CytoscapeComponent
          elements={cyElements}
          stylesheet={theme}
          autoungrabify
          boxSelectionEnabled={false}
          userPanningEnabled={false}
          cy={setCy}
        />
      ) : (
        <div className="firefox-list">
          <h3>Devices</h3>
          <ul>
            {childSubsytemWithoutMnemonics &&
              childSubsytemWithoutMnemonics.assemblyDevices.map(
                (device, index) => {
                  return (
                    <li key={index}>
                      <RuxButton
                        borderless
                        secondary
                        size="small"
                        onClick={handleClick}
                      >
                        {device.name}
                      </RuxButton>
                    </li>
                  );
                }
              )}
          </ul>
        </div>
      )}
    </RuxContainer>
  );
};

export default Assembly;
