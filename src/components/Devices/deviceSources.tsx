import React, { useEffect } from "react";
import { DragPreviewImage, useDrag } from "react-dnd";
import { MidiMachine } from "../../types/MidiMachine";
import { Source } from "src/types/MidiMachinesSources";
import { CustomDragLayer } from "./CustomDragLayer";
import { getEmptyImage } from "react-dnd-html5-backend";

interface DeviceSourcesProps {
  device: MidiMachine;
  onEdit: (device: Source) => void;
}

const DeviceSources: React.FC<DeviceSourcesProps> = ({ device, onEdit }) => {
  return (
    <div
      id={`device-sources-${device.id}`}
      className="mt-4 p-4 bg-gray-600 rounded-md"
    >
      <h3 className="text-xl font-semibold mb-2">
        Sources for {device.display_name}
      </h3>
      {device.sources && device.sources.length > 0 ? (
        <ul className="list-none">
          {device.sources.map((source: Source, index: number) => (
            <DeviceSource key={index} source={source} onEdit={onEdit} />
          ))}
        </ul>
      ) : (
        <p>No sources available for this device.</p>
      )}
    </div>
  );
};

const DeviceSource: React.FC<any> = ({ source, onEdit }) => {
  console.log("source: ", source);
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "SOURCE",
    item: { id: source.id, name: source.display_name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <>
      {/* Original Source Item */}
      <li
        ref={drag as unknown as React.Ref<HTMLLIElement>}
        className={`mb-2 p-2 rounded flex justify-between items-center ${
          isDragging ? "opacity-50" : "opacity-100"
        } bg-gray-700`}
      >
        <div>
          <strong>{source.user_name || source.display_name}</strong> (
          {source.type})
        </div>
        <div className={`flex space-x-2`}>
          <button
            onClick={() => onEdit(source)}
            className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded transition-colors duration-200`}
          >
            Edit
          </button>
        </div>
      </li>
    </>
  );
};

export default DeviceSources;
