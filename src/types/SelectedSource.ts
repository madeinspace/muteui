// src/types/SelectedSource.ts
import { Destination } from "./Destination";
import { SettingItem } from "./SettingItem";

export interface SelectedSource {
  display_name: string;
  user_name: string;
  destination: Destination;
  settings: SettingItem[];
}
