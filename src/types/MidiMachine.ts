import { Setting } from "./MidiMachineSourceSettings";
import { Source } from "./MidiMachinesSources";

export interface MidiMachine {
  display_name: string;
  user_name: string;
  group: string;
  id: number;
  type?: number;
  settings: Setting[];
  sources: Source[];
}
