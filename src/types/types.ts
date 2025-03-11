import { Destination } from "./Destination";
import { SettingItem } from "./SettingItem";

export interface DestinationDetailsProps {
  destination: Destination;
}

export interface NameDisplayProps {
  displayName: string;
  userName: string;
}

export interface SettingsListProps {
  settings: SettingItem[];
  onSettingsChange: (updatedSettings: SettingItem[]) => void;
}
