import React from "react";
import { useDrop } from "react-dnd";

interface ModuleProps {
  name: string;
}

const Module: React.FC<ModuleProps> = ({ name }) => {
  const mutesButtons = Array.from({ length: 8 }, (_, index) => index + 1);

  return (
    <div className="bg-gray-500 rounded-lg shadow-lg p-6 flex flex-col items-center transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
      <h3 className="text-white text-xl font-semibold mb-4">{name}</h3>
      <div className="grid grid-cols-2 gap-4 w-full">
        {mutesButtons.map((muteButton, idx) => (
          <DroppableMuteButton
            key={muteButton}
            id={`${name}-${muteButton}`}
            label={idx === 0 ? "BD Level" : `No assignment`}
          />
        ))}
      </div>
    </div>
  );
};

interface DroppableMuteButtonProps {
  id: string;
  label: string;
}

const DroppableMuteButton: React.FC<DroppableMuteButtonProps> = ({
  id,
  label,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "SOURCE", // Type of draggable item to accept
    drop: (item: { id: string; name: string }) => {
      console.log("item: ", item);
      console.log(`Linked source ${item.name} to mute button ${id}`);
    },
    collect: (monitor) => {
      // console.log("monitor: ", monitor);
      return {
        isOver: monitor.isOver(),
      };
    },
  }));

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`flex flex-col justify-center items-center rounded shadow w-20 h-20 p-2 transition duration-200 ${
        isOver ? "bg-green-500" : "bg-blue-700"
      }`}
    >
      <span className="text-xs mb-1">{label}</span>
    </div>
  );
};

export default Module;
