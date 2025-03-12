import React, { useEffect, useState } from "react";
import { SettingItem } from "src/types/SettingItem";

interface SettingsListProps {
  settings: SettingItem[];
  onSettingsChange?: (updatedSettings: SettingItem[]) => void;
}

const SettingsList: React.FC<SettingsListProps> = ({
  settings,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (id: string | number, value: string | number) => {
    const updatedSettings = localSettings.map((item) => {
      if (item.id === id) {
        // Validate value against min and max
        let newValue: string | number = value;

        if (typeof value === "number") {
          if (item.min !== undefined && value < item.min) {
            newValue = item.min;
          }
          if (item.max !== undefined && value > item.max) {
            newValue = item.max;
          }
        }

        return { ...item, value: newValue };
      }
      return item;
    });

    setLocalSettings(updatedSettings);
    // onSettingsChange(updatedSettings);
  };

  return (
    <div className="w-full mt-4">
      {localSettings.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-center justify-between mb-4 p-4 rounded-md shadow-inner ${index % 2 === 0 ? "bg-gray-200" : "bg-gray-300"
            }`}
        >
          <span className="text-sm font-bold text-gray-700 flex-1">
            {item.display_name}
          </span>

          <div className="flex items-center ml-2">
            {/* <label className="text-xs text-gray-600 mr-1">Value:</label> */}
            <input
              type={typeof item.value === "number" ? "number" : "text"}
              className="w-20 p-1 border rounded-md text-gray-800"
              value={item.value}
              onChange={(e) => {
                const inputValue =
                  typeof item.value === "number"
                    ? Number(e.target.value)
                    : e.target.value;
                handleInputChange(item.id, inputValue);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SettingsList;
