import { Destination } from "./Destination";
import { Setting } from "./MidiMachineSourceSettings";

export interface Source {
  default_dest: number;
  destination: Destination;
  display_name: string;
  settings: Setting[];
  type: number;
  user_name: string;
}
