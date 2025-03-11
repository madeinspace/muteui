// src/types/SettingItem.ts
export interface SettingItem {
  id: string | number;
  display_name: string;
  max?: number; // Optional
  min?: number; // Optional
  value: string | number;
}
