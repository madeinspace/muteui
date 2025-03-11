"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

import createMutesManager, {
  MidiMachine,
  MutesConfig,
  MutesManager,
} from "./MutesConfig";
import { Source } from "src/types/MidiMachinesSources";

interface ConfigContextProps {
  mutesManager: MutesManager;
  muteConfig: MutesConfig;
  setMuteConfig: React.Dispatch<React.SetStateAction<MutesConfig>>;
  addMidiMachine: (machine: MidiMachine) => void;
  removeMidiMachine: (id: number) => void;
  editMidiMachineSettings: (machine: Source) => void;
  selectedSource: Source;
  onDragEnd: (result: any) => void;
}

interface ConfigProviderProps {
  children: ReactNode;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const mutesManager = createMutesManager();
  const [muteConfig, setMuteConfig] = useState<MutesConfig>(
    mutesManager.createEmptyMutesConfig()
  );
  const [moduleAssignments, setModuleAssignments] = useState<any[]>([]);

  const [selectedSource, setSlectedSource] = useState<any>({});

  const addMidiMachine = (machine: MidiMachine) => {
    setMuteConfig((prevConfig) => ({
      ...prevConfig,
      midiMachines: [...prevConfig.midiMachines, machine],
    }));
  };

  const removeMidiMachine = (id: number) => {
    setMuteConfig((prevConfig) => ({
      ...prevConfig,
      midiMachines: prevConfig.midiMachines.filter(
        (machine) => machine.id !== id
      ),
    }));
  };

  const editMidiMachineMutes = (machine: MidiMachine) => {};

  const editMidiMachineSettings = (machine: Source) => {
    console.log("editing setting from machine: ", machine);
    setSlectedSource(machine);
  };

  const assignSourceToModule = (assignment: any) => {
    // setModuleAssignments((prev) => [...prev, assignment]);
    // Optionally, persist to localStorage or backend
  };

  const onDragEnd = useCallback((result: any) => {
    const { source, destination } = result;
    console.log("result: ", result);
    // If dropped outside a droppable area
    if (!destination) return;

    // Extract IDs
    const sourceId = source.droppableId;
    const index = source.index;
    const destinationId = destination.droppableId;

    // Link the source and destination
    // setLinks((prevLinks) => [...prevLinks, { source: sourceId, destination: destinationId }]);
    assignSourceToModule;
    console.log(`Linked ${sourceId}-${index} to ${destinationId}`);
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        mutesManager,
        muteConfig,
        setMuteConfig,
        addMidiMachine,
        removeMidiMachine,
        editMidiMachineSettings,
        selectedSource,
        onDragEnd,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextProps => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
