// components/Devices.tsx

import React, { useEffect, useState } from "react";
import { MidiMachine } from "../../types/MidiMachine"; // Adjust the import path as needed
import DeviceSources from "./deviceSources";
import { Source } from "src/types/MidiMachinesSources";
import { CustomDragLayer } from "./CustomDragLayer";
import { useConfig } from "@/utils/ConfigContext";

const Devices: React.FC = () => {
  const {
    mutesManager,
    addMidiMachine,
    muteConfig,
    editMidiMachineSettings,
  } = useConfig();

  const [midiMachines, setMidiMachines] = useState<MidiMachine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<number | "">("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  // Fetch MIDI machines on component mount
  useEffect(() => {
    console.log("muteConfig: ", muteConfig);

    const fetchMidiMachines = () => {
      const machines = mutesManager.getAllMidiMachines().midiMachines;
      setMidiMachines(machines);
    };

    fetchMidiMachines();
  }, [mutesManager]);

  const handleAddDevice = () => {
    if (selectedMachineId === "") {
      alert("Please select a MIDI device to add.");
      return;
    }

    try {
      const machine = mutesManager.getMidiMachineByID(
        selectedMachineId as number
      );
      addMidiMachine(machine);
      console.log(`Device "${machine.display_name}" added successfully!`);
    } catch (error) {
      console.error(error);
      alert("Failed to add the selected MIDI device.");
    }
  };

  useEffect(() => {
    console.log("from devices muteconfig: ", muteConfig.midiMachines);
  }, [muteConfig]);

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedMachineId(value === "" ? "" : Number(value));
  };

  const handleEditDeviceMutes = (device: Source) => {
    editMidiMachineSettings(device);
  };

  const handleToggleAccordion = (id: number) => {
    if (selectedDeviceId === id) {
      // If the clicked device is already selected, collapse it
      setSelectedDeviceId(null);
    } else {
      // Expand the clicked device and move it to the top
      setSelectedDeviceId(id);
    }
  };

  // Reorder devices: selected device first, then the rest
  const orderedDevices = selectedDeviceId
    ? [
      ...muteConfig.midiMachines.filter(
        (device) => device.id === selectedDeviceId
      ),
      ...muteConfig.midiMachines.filter(
        (device) => device.id !== selectedDeviceId
      ),
    ]
    : muteConfig.midiMachines;

  return (
    <div className="bg-gray-800 text-white p-6 shadow-md flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl mb-4">Midi Devices</h2>
        <label htmlFor="midi-device" className="font-semibold">
          Select MIDI Device:
        </label>
        <select
          id="midi-device"
          value={selectedMachineId}
          onChange={handleSelectionChange}
          className="bg-gray-700 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a MIDI Device --</option>
          {midiMachines.map((machine) => (
            <option key={machine.id} value={machine.id}>
              {machine.display_name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAddDevice}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
      >
        <span className="text-lg">+</span>
        <span>Add Device</span>
      </button>

      <div className="w-full">
        <h2 className="text-1xl font-semibold mb-4">Connected Devices:</h2>
        {muteConfig.midiMachines.length === 0 ? (
          <p className="text-gray-400">No devices added yet.</p>
        ) : (
          <ul className="space-y-3">
            {orderedDevices.map((device) => (
              <li
                key={device.id}
                className="bg-gray-700 p-4 rounded-md shadow-sm"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => handleToggleAccordion(device.id)}
                >
                  <span className="font-medium">{device.display_name}</span>
                  <span className="text-xl">
                    {selectedDeviceId === device.id ? "-" : "+"}
                  </span>
                </div>
                {selectedDeviceId === device.id && (
                  <DeviceSources
                    device={device}
                    onEdit={handleEditDeviceMutes}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        <CustomDragLayer title={"Dragging shit around"} />
      </div>
    </div>
  );
};

export default Devices;
