// utils/MutesConfig.ts

// Enums for various constants
export enum MuteModule {
  Performer = 0,
  Expander1 = 1,
  Expander2 = 2,
  Expander3 = 3,
  Expander4 = 4,
  Expander5 = 5,
  Expander6 = 6,
  Expander7 = 7,
  Expander8 = 8,
}

export enum LinkMode {
  None = 0,
  Stereo = 1,
  Toggle = 2,
}

export enum SourceType {
  CC_VALUE = 0,
  CC_TOGGLE_VALUE = 1,
  PROGRAM_CHANGE = 2,
}

export enum DestinationType {
  MuteChannels = 0,
  Scenes = 1,
  Banks = 2,
}

export enum DefaultMachineID {
  MidiProgramChangeID = 0xac01,
  MidiBankChangeID = 0xab01,
  GMMidiMute = 0xaa51,
  RolandTR6s = 0x0105,
  RolandTR8s = 0x0106,
  ContinuousControllerChange = 0x44,
}

export enum SettingID {
  MidiChannel = 0x1a,
  ProgramNumber = 0xda,
  ToggleOnLevel = 0x3a,
  ToggleOffLevel = 0x35,
  ContinuousControllerChange = 0x44,
  ContinuousControllerValue = 0x65,
  ContinuousControllerNumber = 0x66,
}

// Type Definitions

export type RGB = [number, number, number];

export interface Setting {
  id: SettingID;
  display_name: string;
  value: number;
  min?: number;
  max?: number;
  cannot_edit?: boolean;
}

export interface Destination {
  module: MuteModule;
  index: number;
  dest: DestinationType;
  active: boolean;
}

export interface Source {
  display_name: string;
  user_name: string;
  default_dest: DestinationType;
  destination: Destination;
  type: SourceType;
  settings: Setting[];
}

export interface MidiMachine {
  display_name: string;
  user_name: string;
  group: string;
  id: DefaultMachineID;
  type?: SourceType;
  settings: Setting[];
  sources: Source[];
}

export interface MidiMachineList {
  midiMachines: MidiMachine[];
}

export interface RuntimeColors {
  mute_selected: RGB;
  mute_queued: RGB;
  mute_unselected: RGB;
  mute_unselected_queued: RGB;
  scene_selected: RGB;
  scene_unselected: RGB;
  scene_queued: RGB;
  bank_selected: RGB;
  bank_unselected: RGB;
  bank_queued: RGB;
}

export interface FunctionColors {
  mute_selected: RGB;
  mute_unselected: RGB;
  load_selected: RGB;
  load_unselected: RGB;
  clear_selected: RGB;
  clear_unselected: RGB;
  save_selected: RGB;
  save_unselected: RGB;
  hold_selected: RGB;
  hold_unselected: RGB;
  bank_selected: RGB;
  bank_unselected: RGB;
  cancel_selected: RGB;
  cancel_unselected: RGB;
  reset: RGB;
  copy: RGB;
  copy_source: RGB;
  copy_dest: RGB;
  off: RGB;
}

export interface LinkColors {
  mono_l: RGB;
  mono_r: RGB;
  stereo_l: RGB;
  stereo_r: RGB;
  toggle_l: RGB;
  toggle_r: RGB;
}

export interface MidiColors {
  config_selected: RGB;
  config_unselected: RGB;
  config_sel1: RGB;
  config_sel2: RGB;
  config_sel3: RGB;
  exit_selected: RGB;
  exit_unselected: RGB;
  invert_selected: RGB;
  invert_unselected: RGB;
  unlink_selected: RGB;
  unlink_unselected: RGB;
}

export interface ColorTheme {
  id: number;
  display_name: string;
  colors: {
    runtime: RuntimeColors;
    functions: FunctionColors;
    links: LinkColors;
    midi: MidiColors;
  };
}

export interface ColorThemeList {
  color_theme_list: ColorTheme[];
}

export interface Mute {
  mutes: boolean[];
  mode: LinkMode[];
}

export interface Scene {
  modules: Mute[];
}

export interface Bank {
  selected_scene: number; // Default loaded scene
  scenes: Scene[];
}

export interface MutesConfig {
  schema_version: number;
  selected_bank: number;
  num_expanders: number;
  banks: Bank[];
  colorTheme: ColorTheme;
  midiMachines: MidiMachine[];
}

export interface MidiInputPort { }

export interface MidiOutputPort { }

export type MutesManager = {
  createEmptyMutesConfig: () => MutesConfig;
  loadFromMidi: (
    muteConfig: MutesConfig,
    midiInputPort: MidiInputPort,
    midiOutputPort: MidiOutputPort
  ) => void;
  saveToMidi: (
    muteConfig: MutesConfig,
    midiInputPort: MidiInputPort,
    midiOutputPort: MidiOutputPort
  ) => void;
  getAllColorThemes: () => ColorThemeList;
  getAllMidiMachines: () => MidiMachineList;
  setColorTheme: (mutesConfig: MutesConfig, selectedTheme: ColorTheme) => void;
  toggleMuteStatus: (
    mutesConfig: MutesConfig,
    muteModule: MuteModule,
    bankNum: number,
    sceneNum: number,
    muteChannel: number
  ) => void;
  getMidiMachineByID: (machine_id: DefaultMachineID) => MidiMachine;
};

const DIM = (col: RGB): RGB => {
  const dim_factor = 6;
  return [
    Math.round(col[0] / dim_factor),
    Math.round(col[1] / dim_factor),
    Math.round(col[2] / dim_factor),
  ];
};

const MID = (col: RGB): RGB => {
  const mid_factor = 3;
  return [
    Math.round(col[0] / mid_factor),
    Math.round(col[1] / mid_factor),
    Math.round(col[2] / mid_factor),
  ];
};

export function createMutesManager(): MutesManager {

  // @ts-ignore
  const setMachineSourceSettingByID = (
    machine: MidiMachine,
    sourceIndex: number,
    sid: SettingID,
    value: number
  ): void => {
    const source = machine.sources[sourceIndex];
    const setting = source.settings.find((s) => s.id === sid);
    if (setting) {
      setting.value = value;
    }
  };

  const activateAllDestinations = (machine: MidiMachine): void => {
    machine.sources.forEach((source) => {
      source.destination.active = true;
    });
  };

  const getAllMidiMachines = (): MidiMachineList => {
    const midiMachines: MidiMachine[] = [
      {
        display_name: "Roland TR6s",
        user_name: "",
        group: "Drum Machines",
        id: DefaultMachineID.RolandTR6s,
        settings: [
          {
            id: SettingID.MidiChannel,
            display_name: "MIDI Channel",
            value: 10,
            min: 1,
            max: 16,
          },
        ],
        sources: [
          {
            display_name: "BD Level",
            user_name: "",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 0,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 10,
                min: 1,
                max: 16,
              },
              {
                cannot_edit: true,
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 24,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "SD Level",
            user_name: "",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 1,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 10,
                min: 1,
                max: 16,
              },
              {
                cannot_edit: true,
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 29,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "LT Level",
            user_name: "",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 2,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 10,
                min: 1,
                max: 16,
              },
              {
                cannot_edit: true,
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 48,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "HC Level",
            user_name: "",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 3,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 10,
                min: 1,
                max: 16,
              },
              {
                cannot_edit: true,
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 60,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "CH Level",
            user_name: "",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 4,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 10,
                min: 1,
                max: 16,
              },
              {
                cannot_edit: true,
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 63,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "OH Level",
            user_name: "",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 5,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 10,
                min: 1,
                max: 16,
              },
              {
                cannot_edit: true,
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 82,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Reverb Level",
            user_name: "",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 6,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 10,
                min: 1,
                max: 16,
              },
              {
                cannot_edit: true,
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 91,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
        ],
      },
      {
        display_name: "Program Change",
        user_name: "",
        group: "General MIDI",
        id: DefaultMachineID.MidiProgramChangeID,
        settings: [
          {
            id: SettingID.MidiChannel,
            display_name: "MIDI Channel",
            value: 1,
            min: 1,
            max: 16,
          },
        ],
        sources: [
          {
            display_name: "Program Change",
            user_name: "Program 1",
            default_dest: DestinationType.Scenes,
            destination: {
              module: MuteModule.Performer,
              index: 0,
              dest: DestinationType.Scenes,
              active: false,
            },
            type: SourceType.PROGRAM_CHANGE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ProgramNumber,
                display_name: "Program Number",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Program Change",
            user_name: "Program 2",
            default_dest: DestinationType.Scenes,
            destination: {
              module: MuteModule.Performer,
              index: 1,
              dest: DestinationType.Scenes,
              active: false,
            },
            type: SourceType.PROGRAM_CHANGE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ProgramNumber,
                display_name: "Program Number",
                value: 1,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Program Change",
            user_name: "Program 3",
            default_dest: DestinationType.Scenes,
            destination: {
              module: MuteModule.Performer,
              index: 2,
              dest: DestinationType.Scenes,
              active: false,
            },
            type: SourceType.PROGRAM_CHANGE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ProgramNumber,
                display_name: "Program Number",
                value: 2,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Program Change",
            user_name: "Program 4",
            default_dest: DestinationType.Scenes,
            destination: {
              module: MuteModule.Performer,
              index: 3,
              dest: DestinationType.Scenes,
              active: false,
            },
            type: SourceType.PROGRAM_CHANGE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ProgramNumber,
                display_name: "Program Number",
                value: 3,
                min: 0,
                max: 127,
              },
            ],
          },
        ],
      },
      {
        display_name: "Bank Select (CC #0)",
        user_name: "",
        group: "General MIDI",
        type: SourceType.CC_VALUE,
        id: DefaultMachineID.MidiBankChangeID,
        settings: [
          {
            id: SettingID.MidiChannel,
            display_name: "MIDI Channel",
            value: 1,
            min: 1,
            max: 16,
          },
          {
            cannot_edit: true,
            id: SettingID.ContinuousControllerNumber,
            display_name: "CC Number",
            value: 0,
          },
        ],
        sources: [
          {
            display_name: "Bank Select",
            user_name: "Bank 1",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 0,
              dest: DestinationType.Banks,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "Bank Number",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Bank Select",
            user_name: "Bank 2",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 1,
              dest: DestinationType.Banks,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "Bank Number",
                value: 1,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Bank Select",
            user_name: "Bank 3",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 2,
              dest: DestinationType.Banks,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "Bank Number",
                value: 2,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Bank Select",
            user_name: "Bank 4",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 3,
              dest: DestinationType.Banks,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "Bank Number",
                value: 3,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Bank Select",
            user_name: "Bank 5",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 4,
              dest: DestinationType.Banks,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "Bank Number",
                value: 4,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Bank Select",
            user_name: "Bank 6",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 5,
              dest: DestinationType.Banks,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "Bank Number",
                value: 5,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Bank Select",
            user_name: "Bank 7",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 6,
              dest: DestinationType.Banks,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "Bank Number",
                value: 6,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Bank Select",
            user_name: "Bank 8",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 7,
              dest: DestinationType.Banks,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "Bank Number",
                value: 7,
                min: 0,
                max: 127,
              },
            ],
          },
        ],
      },
      {
        display_name: "MIDI CC Change",
        user_name: "",
        group: "General MIDI",
        id: DefaultMachineID.ContinuousControllerChange,
        settings: [
          {
            id: SettingID.MidiChannel,
            display_name: "MIDI Channel",
            value: 1,
            min: 1,
            max: 16,
          },
        ],
        type: SourceType.CC_VALUE,
        sources: [
          {
            display_name: "MIDI CC Change",
            user_name: "Modulation (CC #1)",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 0,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 1,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "CC Value",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "MIDI CC Change",
            user_name: "Breath Controller (CC #2)",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 1,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 2,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "CC Value",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "MIDI CC Change",
            user_name: "Balance (CC #8)",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 1,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 8,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "CC Value",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "MIDI CC Change",
            user_name: "Expression (CC #11)",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 2,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 11,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "CC Value",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "MIDI CC Change",
            user_name: "General Purpose (CC #16)",
            default_dest: DestinationType.Banks,
            destination: {
              module: MuteModule.Performer,
              index: 3,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ContinuousControllerNumber,
                display_name: "CC Number",
                value: 16,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ContinuousControllerValue,
                display_name: "CC Value",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
        ],
      },
      {
        display_name: "MIDI Mute (MIDI CC 7 - Volume)",
        user_name: "",
        group: "General MIDI",
        id: DefaultMachineID.GMMidiMute,
        type: SourceType.CC_TOGGLE_VALUE,
        settings: [
          {
            cannot_edit: true,
            id: SettingID.ContinuousControllerNumber,
            display_name: "CC Number",
            value: 7,
          },
        ],
        sources: [
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 1",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 0,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 1,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 2",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 1,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 2,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 3",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 2,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 3,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 4",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 3,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 4,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 5",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 4,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 5,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 6",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 5,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 6,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 7",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 6,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 7,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 8",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Performer,
              index: 7,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 8,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 9",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Expander1,
              index: 0,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 9,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 10",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Expander1,
              index: 1,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 10,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 11",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Expander1,
              index: 2,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 11,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 12",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Expander1,
              index: 3,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 12,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 13",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Expander1,
              index: 4,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 13,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 14",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Expander1,
              index: 5,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 14,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 15",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Expander1,
              index: 6,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 15,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
          {
            display_name: "Volume CC Mute",
            user_name: "Channel 16",
            default_dest: DestinationType.MuteChannels,
            destination: {
              module: MuteModule.Expander1,
              index: 7,
              dest: DestinationType.MuteChannels,
              active: false,
            },
            type: SourceType.CC_TOGGLE_VALUE,
            settings: [
              {
                id: SettingID.MidiChannel,
                display_name: "MIDI Channel",
                value: 16,
                min: 1,
                max: 16,
              },
              {
                id: SettingID.ToggleOnLevel,
                display_name: "Un-muted Volume Level",
                value: 127,
                min: 0,
                max: 127,
              },
              {
                id: SettingID.ToggleOffLevel,
                display_name: "Muted Volume Level",
                value: 0,
                min: 0,
                max: 127,
              },
            ],
          },
        ],
      },
    ];

    return { midiMachines };
  };

  const all_midi_machines = getAllMidiMachines();

  const getMidiMachineByID = (machine_id: DefaultMachineID): MidiMachine => {
    const machine = all_midi_machines.midiMachines.find(
      (m) => m.id === machine_id
    );
    if (!machine) {
      throw new Error(
        `getMidiMachineByID - Unknown Machine ID ${machine_id.toString()}`
      );
    }
    return structuredClone(machine);
  };

  const getAllColorThemes = (): ColorThemeList => {
    const RGB_RED: RGB = [0xff, 0x00, 0x00];
    const RGB_GREEN: RGB = [0x00, 0xff, 0x00];
    const RGB_BLUE: RGB = [0x00, 0x00, 0xff];
    const RGB_YELLOW: RGB = [0xff, 0xff, 0x00];
    const RGB_ORANGE: RGB = [0xff, 0x55, 0x05];
    const RGB_PURPLE: RGB = [0xff, 0x00, 0xff];
    const RGB_WHITE: RGB = [0xff, 0xff, 0xff];
    const RGB_CYAN: RGB = [0x00, 0xdd, 0xff];

    return {
      color_theme_list: [
        {
          display_name: "Standard",
          id: 0xbad0,
          colors: {
            runtime: {
              mute_selected: RGB_RED,
              mute_queued: RGB_ORANGE,
              mute_unselected: DIM(RGB_WHITE),
              mute_unselected_queued: MID(RGB_GREEN),
              scene_selected: RGB_CYAN,
              scene_unselected: DIM(RGB_CYAN),
              scene_queued: RGB_WHITE,
              bank_selected: RGB_YELLOW,
              bank_unselected: DIM(RGB_YELLOW),
              bank_queued: RGB_WHITE,
            },
            functions: {
              mute_selected: RGB_GREEN,
              mute_unselected: DIM(RGB_GREEN),
              load_selected: RGB_ORANGE,
              load_unselected: DIM(RGB_ORANGE),
              clear_selected: RGB_RED,
              clear_unselected: DIM(RGB_RED),
              save_selected: RGB_PURPLE,
              save_unselected: DIM(RGB_PURPLE),
              hold_selected: RGB_BLUE,
              hold_unselected: DIM(RGB_BLUE),
              bank_selected: RGB_YELLOW,
              bank_unselected: DIM(RGB_YELLOW),
              cancel_selected: RGB_WHITE,
              cancel_unselected: DIM(RGB_WHITE),
              reset: RGB_WHITE,
              copy: RGB_ORANGE,
              copy_source: RGB_ORANGE,
              copy_dest: RGB_PURPLE,
              off: [0x00, 0x00, 0x00],
            },
            links: {
              mono_l: DIM(RGB_WHITE),
              mono_r: DIM(RGB_WHITE),
              stereo_l: DIM(RGB_WHITE),
              stereo_r: DIM(RGB_RED),
              toggle_l: DIM(RGB_GREEN),
              toggle_r: DIM(RGB_GREEN),
            },
            midi: {
              config_selected: RGB_BLUE,
              config_unselected: DIM(RGB_BLUE),
              config_sel1: RGB_BLUE,
              config_sel2: RGB_RED,
              config_sel3: RGB_GREEN,
              exit_selected: RGB_WHITE,
              exit_unselected: DIM(RGB_WHITE),
              invert_selected: RGB_ORANGE,
              invert_unselected: DIM(RGB_ORANGE),
              unlink_selected: RGB_GREEN,
              unlink_unselected: DIM(RGB_GREEN),
            },
          },
        },
        {
          display_name: "High Contrast",
          id: 0xb33f,
          colors: {
            runtime: {
              mute_selected: RGB_RED,
              mute_queued: RGB_ORANGE,
              mute_unselected: DIM(RGB_WHITE),
              mute_unselected_queued: MID(RGB_GREEN),
              scene_selected: RGB_CYAN,
              scene_unselected: DIM(RGB_CYAN),
              scene_queued: RGB_WHITE,
              bank_selected: RGB_YELLOW,
              bank_unselected: DIM(RGB_YELLOW),
              bank_queued: RGB_WHITE,
            },
            functions: {
              mute_selected: RGB_GREEN,
              mute_unselected: DIM(RGB_GREEN),
              load_selected: RGB_ORANGE,
              load_unselected: DIM(RGB_ORANGE),
              clear_selected: RGB_RED,
              clear_unselected: DIM(RGB_RED),
              save_selected: RGB_PURPLE,
              save_unselected: DIM(RGB_PURPLE),
              hold_selected: RGB_BLUE,
              hold_unselected: DIM(RGB_BLUE),
              bank_selected: RGB_YELLOW,
              bank_unselected: DIM(RGB_YELLOW),
              cancel_selected: RGB_WHITE,
              cancel_unselected: DIM(RGB_WHITE),
              reset: RGB_WHITE,
              copy: RGB_ORANGE,
              copy_source: RGB_ORANGE,
              copy_dest: RGB_PURPLE,
              off: [0x00, 0x00, 0x00],
            },
            links: {
              mono_l: DIM(RGB_WHITE),
              mono_r: DIM(RGB_WHITE),
              stereo_l: DIM(RGB_WHITE),
              stereo_r: DIM(RGB_RED),
              toggle_l: DIM(RGB_GREEN),
              toggle_r: DIM(RGB_GREEN),
            },
            midi: {
              config_selected: RGB_BLUE,
              config_unselected: DIM(RGB_BLUE),
              config_sel1: RGB_BLUE,
              config_sel2: RGB_RED,
              config_sel3: RGB_GREEN,
              exit_selected: RGB_WHITE,
              exit_unselected: DIM(RGB_WHITE),
              invert_selected: RGB_ORANGE,
              invert_unselected: DIM(RGB_ORANGE),
              unlink_selected: RGB_GREEN,
              unlink_unselected: DIM(RGB_GREEN),
            },
          },
        },
        {
          display_name: "Some Funky Colors",
          id: 0xdead,
          colors: {
            runtime: {
              mute_selected: RGB_RED,
              mute_queued: RGB_ORANGE,
              mute_unselected: DIM(RGB_WHITE),
              mute_unselected_queued: MID(RGB_GREEN),
              scene_selected: RGB_CYAN,
              scene_unselected: DIM(RGB_CYAN),
              scene_queued: RGB_WHITE,
              bank_selected: RGB_YELLOW,
              bank_unselected: DIM(RGB_YELLOW),
              bank_queued: RGB_WHITE,
            },
            functions: {
              mute_selected: RGB_GREEN,
              mute_unselected: DIM(RGB_GREEN),
              load_selected: RGB_ORANGE,
              load_unselected: DIM(RGB_ORANGE),
              clear_selected: RGB_RED,
              clear_unselected: DIM(RGB_RED),
              save_selected: RGB_PURPLE,
              save_unselected: DIM(RGB_PURPLE),
              hold_selected: RGB_BLUE,
              hold_unselected: DIM(RGB_BLUE),
              bank_selected: RGB_YELLOW,
              bank_unselected: DIM(RGB_YELLOW),
              cancel_selected: RGB_WHITE,
              cancel_unselected: DIM(RGB_WHITE),
              reset: RGB_WHITE,
              copy: RGB_ORANGE,
              copy_source: RGB_ORANGE,
              copy_dest: RGB_PURPLE,
              off: [0x00, 0x00, 0x00],
            },
            links: {
              mono_l: DIM(RGB_WHITE),
              mono_r: DIM(RGB_WHITE),
              stereo_l: DIM(RGB_WHITE),
              stereo_r: DIM(RGB_RED),
              toggle_l: DIM(RGB_GREEN),
              toggle_r: DIM(RGB_GREEN),
            },
            midi: {
              config_selected: RGB_BLUE,
              config_unselected: DIM(RGB_BLUE),
              config_sel1: RGB_BLUE,
              config_sel2: RGB_RED,
              config_sel3: RGB_GREEN,
              exit_selected: RGB_WHITE,
              exit_unselected: DIM(RGB_WHITE),
              invert_selected: RGB_ORANGE,
              invert_unselected: DIM(RGB_ORANGE),
              unlink_selected: RGB_GREEN,
              unlink_unselected: DIM(RGB_GREEN),
            },
          },
        },
      ],
    };
  };

  const setColorTheme = (
    mutesConfig: MutesConfig,
    selectedTheme: ColorTheme
  ): void => {
    const clonedTheme = structuredClone(selectedTheme);
    mutesConfig.colorTheme.id = clonedTheme.id;
    mutesConfig.colorTheme.display_name = clonedTheme.display_name;
    mutesConfig.colorTheme.colors = clonedTheme.colors;
  };

  const createEmptyMute = (): Mute => {
    return {
      mutes: Array(8).fill(false),
      mode: Array(8).fill(LinkMode.None),
    };
  };

  const createEmptyScene = (): Scene => {
    return {
      modules: Array(9)
        .fill(null)
        .map(() => createEmptyMute()),
    };
  };

  const createEmptyBank = (): Bank => {
    return {
      selected_scene: 0,
      scenes: Array(4)
        .fill(null)
        .map(() => createEmptyScene()),
    };
  };

  const createEmptyMutesConfig = (): MutesConfig => {
    const muteCfg: MutesConfig = {
      schema_version: 101,
      selected_bank: 0,
      num_expanders: 8,
      banks: Array(8)
        .fill(null)
        .map(() => createEmptyBank()),
      colorTheme: {
        id: 0,
        display_name: "",
        colors: {
          runtime: {
            mute_selected: [0, 0, 0],
            mute_queued: [0, 0, 0],
            mute_unselected: [0, 0, 0],
            mute_unselected_queued: [0, 0, 0],
            scene_selected: [0, 0, 0],
            scene_unselected: [0, 0, 0],
            scene_queued: [0, 0, 0],
            bank_selected: [0, 0, 0],
            bank_unselected: [0, 0, 0],
            bank_queued: [0, 0, 0],
          },
          functions: {
            mute_selected: [0, 0, 0],
            mute_unselected: [0, 0, 0],
            load_selected: [0, 0, 0],
            load_unselected: [0, 0, 0],
            clear_selected: [0, 0, 0],
            clear_unselected: [0, 0, 0],
            save_selected: [0, 0, 0],
            save_unselected: [0, 0, 0],
            hold_selected: [0, 0, 0],
            hold_unselected: [0, 0, 0],
            bank_selected: [0, 0, 0],
            bank_unselected: [0, 0, 0],
            cancel_selected: [0, 0, 0],
            cancel_unselected: [0, 0, 0],
            reset: [0, 0, 0],
            copy: [0, 0, 0],
            copy_source: [0, 0, 0],
            copy_dest: [0, 0, 0],
            off: [0, 0, 0],
          },
          links: {
            mono_l: [0, 0, 0],
            mono_r: [0, 0, 0],
            stereo_l: [0, 0, 0],
            stereo_r: [0, 0, 0],
            toggle_l: [0, 0, 0],
            toggle_r: [0, 0, 0],
          },
          midi: {
            config_selected: [0, 0, 0],
            config_unselected: [0, 0, 0],
            config_sel1: [0, 0, 0],
            config_sel2: [0, 0, 0],
            config_sel3: [0, 0, 0],
            exit_selected: [0, 0, 0],
            exit_unselected: [0, 0, 0],
            invert_selected: [0, 0, 0],
            invert_unselected: [0, 0, 0],
            unlink_selected: [0, 0, 0],
            unlink_unselected: [0, 0, 0],
          },
        },
      },
      midiMachines: [],
    };

    const colorThemes = getAllColorThemes().color_theme_list;
    setColorTheme(muteCfg, colorThemes[0]);

    /*
    // Uncomment and implement if needed
    for (let pc = 0; pc < 4; pc++) {
    const prog_change = getMidiMachineByID(DefaultMachineID.MidiProgramChangeID);
    setMachineSourceSettingByID(prog_change, 0, SettingID.MidiChannel, 9);
    setMachineSourceSettingByID(prog_change, 0, SettingID.ProgramNumber, pc);
    // setSourceLocation(prog_change, 0, MuteModule.Performer, DestinationType.Scenes, pc);
    muteCfg.midiMachines.push(prog_change);
    }
  
    for (let bc = 0; bc < 8; bc++) {
    const bank_change = getMidiMachineByID(DefaultMachineID.MidiBankChangeID);
    setMachineSourceSettingByID(bank_change, 0, SettingID.MidiChannel, 9);
    setMachineSourceSettingByID(bank_change, 0, SettingID.ContinuousControllerValue, bc);
    // setSourceLocation(bank_change, 0, MuteModule.Performer, DestinationType.Banks, bc);
    muteCfg.midiMachines.push(bank_change);
    }
  
    for (let m = 0; m < 16; m++) {
    const mute = getMidiMachineByID(DefaultMachineID.GMMidiMute);
    setMachineSourceSettingByID(mute, 0, SettingID.MidiChannel, m + 1);
    // setSourceLocation(mute, 0, m < 8 ? MuteModule.Performer : MuteModule.Expander1, DestinationType.MuteChannels, m < 8 ? m : m - 8);
    muteCfg.midiMachines.push(mute);
    }
    */

    const bank_change = getMidiMachineByID(DefaultMachineID.MidiBankChangeID);
    activateAllDestinations(bank_change);
    muteCfg.midiMachines.push(bank_change);

    const prog_change = getMidiMachineByID(
      DefaultMachineID.MidiProgramChangeID
    );
    activateAllDestinations(prog_change);
    muteCfg.midiMachines.push(prog_change);

    const mutes = getMidiMachineByID(DefaultMachineID.GMMidiMute);
    activateAllDestinations(mutes);
    muteCfg.midiMachines.push(mutes);

    return muteCfg;
  };

  const toggleMuteStatus = (
    mutesConfig: MutesConfig,
    muteModule: MuteModule,
    bankNum: number,
    sceneNum: number,
    muteChannel: number
  ): void => {
    const currentStatus =
      mutesConfig.banks[bankNum].scenes[sceneNum].modules[muteModule].mutes[
      muteChannel
      ];
    mutesConfig.banks[bankNum].scenes[sceneNum].modules[muteModule].mutes[
      muteChannel
    ] = !currentStatus;
  };

  const loadFromMidi = (
  ): void => {
    console.warn("loadFromMidi - Not implemented yet.");
  };

  const saveToMidi = (
  ): void => {
    console.warn("saveToMidi - Not implemented yet.");
  };

  return {
    createEmptyMutesConfig,
    loadFromMidi,
    saveToMidi,
    getAllColorThemes,
    getAllMidiMachines,
    setColorTheme,
    toggleMuteStatus,
    getMidiMachineByID,
  };
}

export default createMutesManager;
