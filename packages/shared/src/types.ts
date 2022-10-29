import { SCALE, ROOT_NOTE } from './enums';

export type Octave = '0' | '1' | '2' | '3' | '4' | '5' | '6';

export type ScaleDef = {
    [k in SCALE]: [number, number, number, number, number, number, number];
};

export interface Pad {
    pad: number;
}

export interface RootSettingsPad extends Pad {
    root: ROOT_NOTE;
}

export interface ScaleSettingsPad extends Pad {
    scale: SCALE;
}

export interface OctaveSettingsPad extends Pad {
    octave: Octave;
}

export interface OnOffPad extends Pad {
    on: boolean;
}

export interface DevicePad extends Pad {
    empty: boolean;
    active: boolean;
    layer: boolean;
    c: number;
    r: number;
}

export interface DeviceLayerPad extends Pad {
    empty: boolean;
    chain: boolean;
    muted: boolean;
    c: number;
    d: number;
    l: number;
}

export interface LauncherPad extends Pad {
    empty: boolean;
    playing: boolean;
    toPlay: boolean;
    isGroup: boolean;
    c: number;
    r: number;
}

export interface KeyboardSettings {
    scaleSettings: API.SettableEnumValue;
    rootNoteSettings: API.SettableEnumValue;
    octaveSettings: API.SettableEnumValue;
}

export interface KeyboardPad extends Pad {
    note: number;
    isRoot: boolean;
}

export interface MidiEvent {
    status: number;
    data1: number;
    data2: number;
}

export interface PadCoord {
    [pad: number]: { c: number; r: number };
}
