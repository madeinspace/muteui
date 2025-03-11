// src/components/Settings.tsx
import React from "react";
import NameDisplay from "./nameDisplay";
import DestinationDetails from "./destinationDetails";
import SettingsList from "./settingList";
import { useConfig } from "@/utils/ConfigContext";

export const Settings: React.FC = () => {
  const {
    selectedSource,
    selectedSource: { settings, destination, display_name, user_name },
  } = useConfig();

  // useEffect(() => {
  //   console.log("selectedSource: ", selectedSource);
  // }, [settings]);

  if (!selectedSource) {
    return (
      <div className="bg-gray-300 text-white p-4">
        No selected source available.
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-6 shadow-md flex flex-col items-start w-full ">
      <h2 className="text-2xl mb-4">Settings</h2>

      {Array.isArray(settings) && settings.length > 0 ? (
        <div className="w-full mt-4">
          <NameDisplay displayName={display_name} userName={user_name} />
          <SettingsList settings={settings} />
          <DestinationDetails destination={destination} />
        </div>
      ) : (
        <p>No settings available.</p>
      )}
    </div>
  );
};
