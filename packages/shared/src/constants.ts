import { CONTROLLER_MODE, SCALE, ROOT_NOTE } from './enums';
import {
    Pad,
    Octave,
    RootSettingsPad,
    ScaleSettingsPad,
    ScaleDef,
    OctaveSettingsPad,
} from './types';

export const GRID_SIZE = 8;
export const SENDS = 3;

export const DEVICE_NAMES = ['APC MINI'];

export const DEVICE_NAMES_DUAL = ['APC MINI', 'APC MINI #2'];

export const MIDI_PORTS = DEVICE_NAMES.length;

export const MIDI_PORTS_DUAL = DEVICE_NAMES_DUAL.length;

export const BOTTOM_ROW_START = 64;

export const BOTTOM_ROW: Pad[] = [];
for (let i = 0; i < GRID_SIZE; i++) {
    BOTTOM_ROW.push({
        pad: BOTTOM_ROW_START + i,
    });
}

export const DEFINED_MODES = Object.keys(CONTROLLER_MODE);

export const DEFINED_SCALES = Object.keys(SCALE);

export const DEFINED_ROOTS = Object.keys(ROOT_NOTE).map((k) => ROOT_NOTE[k]);

export const DEFINED_OCTAVES: Octave[] = ['0', '1', '2', '3', '4', '5', '6'];

export const ROOT_SETTINGS_LAYOUT: RootSettingsPad[] = [
    {
        pad: 0,
        root: ROOT_NOTE.C,
    },
    {
        pad: 8,
        root: ROOT_NOTE.Cis,
    },
    {
        pad: 1,
        root: ROOT_NOTE.D,
    },
    {
        pad: 9,
        root: ROOT_NOTE.Dis,
    },
    {
        pad: 2,
        root: ROOT_NOTE.E,
    },
    {
        pad: 3,
        root: ROOT_NOTE.F,
    },
    {
        pad: 11,
        root: ROOT_NOTE.Fis,
    },
    {
        pad: 4,
        root: ROOT_NOTE.G,
    },
    {
        pad: 12,
        root: ROOT_NOTE.Gis,
    },
    {
        pad: 5,
        root: ROOT_NOTE.A,
    },
    {
        pad: 13,
        root: ROOT_NOTE.Ais,
    },
    {
        pad: 6,
        root: ROOT_NOTE.B,
    },
];

export const OCTAVE_SETTINGS_LAYOUT: OctaveSettingsPad[] = DEFINED_OCTAVES.map(
    (item, i) => {
        return {
            pad: 24 + i,
            octave: item,
        };
    }
);

export const SCALE_SETTINGS_LAYOUT: ScaleSettingsPad[] = DEFINED_SCALES.map(
    (scale, i) => {
        return {
            pad: 40 + i,
            scale: SCALE[scale],
        };
    }
);

export const SCALES: ScaleDef = {
    [SCALE.MAJOR]: [0, 2, 4, 5, 7, 9, 11],
    [SCALE.MINOR]: [0, 2, 3, 5, 7, 8, 10],
    [SCALE.DORIAN]: [0, 2, 3, 5, 7, 9, 10],
    [SCALE.MIXOLYDIAN]: [0, 2, 4, 5, 7, 9, 10],
    [SCALE.LYDIAN]: [0, 2, 4, 6, 7, 9, 11],
    [SCALE.PHRYGIAN]: [0, 1, 3, 5, 7, 8, 10],
    [SCALE.LOCRIAN]: [0, 1, 3, 5, 6, 8, 10],
    [SCALE.HARMONIC_MINOR]: [0, 2, 3, 5, 7, 8, 11],
    [SCALE.HARMONIC_MAJOR]: [0, 2, 4, 5, 7, 8, 11],
    [SCALE.DORIAN_NR_4]: [0, 2, 3, 6, 7, 9, 10],
    [SCALE.PHRYGIAN_DOMINANT]: [0, 1, 4, 5, 7, 8, 10],
    [SCALE.MELODIC_MINOR]: [0, 2, 3, 5, 7, 9, 11],
    [SCALE.LYDIAN_AUGMENTED]: [0, 2, 4, 6, 8, 9, 11],
    [SCALE.LYDIAN_DOMINANT]: [0, 2, 4, 6, 7, 9, 10],
    [SCALE.HUNGARIAN_MINOR]: [0, 2, 3, 6, 7, 8, 11],
    [SCALE.SUPER_LOCRIAN]: [0, 1, 3, 4, 6, 8, 10],
    [SCALE.SPANISH]: [0, 1, 4, 5, 7, 9, 10],
    [SCALE.BHAIRAV]: [0, 1, 4, 5, 7, 8, 11],
};

export const NO_NUMBER = -1;
