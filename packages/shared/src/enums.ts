export enum EVENT_STATUS {
    NOTE_ON = 144,
    NOTE_OFF = 128,
}

export enum CONTROLLER_MODE {
    LAUNCHER = 'LAUNCHER',
    KEYBOARD = 'KEYBOARD',
}

export enum BUTTON {
    UP = 82,
    DOWN = 83,
    RIGHT = 84,
    LEFT = 85,

    SWICTH_TO_LAUNCHER = 87,
    SWITCH_TO_KEYBOARD = 88,

    STOP_ALL = 89,

    SHIFT = 98,
}

export enum BUTTON_COLOR {
    OFF = 0,
    GREEN = 1,
    RED = 3,
    ORANGE = 5,
    GREEN_BLINK = 2,
    RED_BLINK = 4,
    ORANGE_BLINK = 6,
}

export enum SCALE {
    MAJOR = 'MAJOR',
    MINOR = 'MINOR',
    DORIAN = 'DORIAN',
    MIXOLYDIAN = 'MIXOLYDIAN',
    LYDIAN = 'LYDIAN',
    PHRYGIAN = 'PHRYGIAN',
    LOCRIAN = 'LOCRIAN',
    HARMONIC_MINOR = 'HARMONIC_MINOR',
    HARMONIC_MAJOR = 'HARMONIC_MAJOR',
    DORIAN_NR_4 = 'DORIAN_NR_4',
    PHRYGIAN_DOMINANT = 'PHRYGIAN_DOMINANT',
    MELODIC_MINOR = 'MELODIC_MINOR',
    LYDIAN_AUGMENTED = 'LYDIAN_AUGMENTED',
    LYDIAN_DOMINANT = 'LYDIAN_DOMINANT',
    HUNGARIAN_MINOR = 'HUNGARIAN_MINOR',
    SUPER_LOCRIAN = 'SUPER_LOCRIAN',
    SPANISH = 'SPANISH',
    BHAIRAV = 'BHAIRAV',
}

export enum ROOT_NOTE {
    C = 'C',
    Cis = 'C#/Db',
    D = 'D',
    Dis = 'D#/Eb',
    E = 'E',
    F = 'F',
    Fis = 'F#/Gb',
    G = 'G',
    Gis = 'G#/Ab',
    A = 'A',
    Ais = 'A#/Ab',
    B = 'B',
}
