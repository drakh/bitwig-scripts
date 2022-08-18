type Octave = '0' | '1' | '2' | '3' | '4' | '5' | '6';

type ScaleDef = {
    [k in SCALE]: [number, number, number, number, number, number, number];
};

interface Pad {
    pad: number;
}

interface RootSettingsPad extends Pad {
    root: ROOT_NOTE;
}

interface ScaleSettingsPad extends Pad {
    scale: SCALE;
}

interface OctaveSettingsPad extends Pad {
    octave: Octave;
}

interface ArmedPad extends Pad {
    armed: boolean;
}

interface KeyboardSettings {
    scaleSettings: API.SettableEnumValue;
    rootNoteSettings: API.SettableEnumValue;
    octaveSettings: API.SettableEnumValue;
}

interface KeyboardPad extends Pad {
    note: number;
    isRoot: boolean;
}

interface MidiEvent {
    status: number;
    data1: number;
    data2: number;
}

enum BUTTON {
    UP = 82,
    DOWN = 83,
    FORWARD = 84,
    BACKWARD = 85,

    SWITCH_TO_KEYBOARD = 87,
    SWICTH_TO_LAUNCHER = 88,

    STOP_ALL = 89,

    SHIFT = 98,
}

enum BUTTON_COLOR {
    OFF = 0,
    GREEN = 1,
    RED = 3,
    ORANGE = 5,
    GREEN_BLINK = 2,
    RED_BLINK = 4,
    ORANGE_BLINK = 6,
}

enum SCALE {
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

enum ROOT_NOTE {
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

loadAPI(17);
host.setShouldFailOnDeprecatedUse(true);

host.defineController(
    'Drakh',
    'AKAI APC mini keyboard',
    '0.1',
    'afe40d74-df95-4637-9a79-6f773aa7fc64',
    'drakh'
);

const GRID_SIZE = 8;
const SENDS = 3;

const DEVICE_NAMES = [
    'APC MINI',
    // 'APC MINI #2'
];

const MIDI_PORTS = DEVICE_NAMES.length;

host.defineMidiPorts(MIDI_PORTS, MIDI_PORTS);

host.addDeviceNameBasedDiscoveryPair(DEVICE_NAMES, DEVICE_NAMES);

const BOTTOM_ROW_START = 64;

const BOTTOM_ROW: Pad[] = [];
for (let i = 0; i < 8; i++) {
    BOTTOM_ROW.push({
        pad: BOTTOM_ROW_START + i,
    });
}

const DEFINED_SCALES = Object.keys(SCALE);

const DEFINED_ROOTS = Object.keys(ROOT_NOTE).map((k) => ROOT_NOTE[k]);

const DEFINED_OCTAVES: Octave[] = ['0', '1', '2', '3', '4', '5', '6'];

const ROOT_SETTINGS_LAYOU: RootSettingsPad[] = [
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

const OCTAVE_SETTINGS_LAYOUT: OctaveSettingsPad[] = DEFINED_OCTAVES.map(
    (item, i) => {
        return {
            pad: 24 + i,
            octave: item,
        };
    }
);

const SCALE_SETTINGS_LAYOUT: ScaleSettingsPad[] = DEFINED_SCALES.map(
    (scale, i) => {
        return {
            pad: 40 + i,
            scale: SCALE[scale],
        };
    }
);

const SCALES: ScaleDef = {
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

const mapPadToScale = (
    pad: number,
    rootNote: ROOT_NOTE,
    baseOcatve: Octave,
    scaleType: SCALE,
    isActive: boolean,
    isShift: boolean
): KeyboardPad => {
    const scale = SCALES[scaleType];
    const c = pad % GRID_SIZE;
    const r = Math.floor(pad / GRID_SIZE);
    const n = r * 3 + c;
    const noteIndex = n % 7;
    const isRoot = noteIndex === 0;
    const octave = Math.floor(n / 7);
    const octaveOffset = DEFINED_OCTAVES.indexOf(baseOcatve);
    const noteOffset = DEFINED_ROOTS.indexOf(rootNote);
    const note =
        isActive && !isShift
            ? scale[noteIndex] + octaveOffset * 12 + noteOffset + octave * 12
            : -1;
    return { pad, note, isRoot };
};

const createKeyboardFilter = (): any => {
    const args: string[] = [];
    for (let i = 0; i < 64; i++) {
        const p = `000${i.toString(16)}`.slice(-2);
        args.push(`80${p}??`);
        args.push(`90${p}??`);
    }
    return args;
};

class ApcBase {
    protected readonly deviceIdx: number;
    protected readonly midiIn: API.MidiIn;
    protected readonly midiOut: API.MidiOut;

    private shift: boolean = false;
    private active: boolean = false;
    private midiEvents: MidiEvent[] = [];

    constructor(deviceIdx: number, midiIn: API.MidiIn, midiOut: API.MidiOut) {
        this.deviceIdx = deviceIdx;
        this.midiIn = midiIn;
        this.midiOut = midiOut;
    }

    public flush() {
        const { midiOut, midiEvents } = this;

        midiEvents.forEach(({ status, data1, data2 }) => {
            midiOut.sendMidi(status, data1, data2);
        });

        this.midiEvents = [];
    }

    protected setShift(s: boolean) {
        this.shift = s;
    }

    protected isShift(): boolean {
        return this.shift;
    }

    protected isActive(): boolean {
        return this.active;
    }

    protected activate() {
        this.active = true;
        this.clearPads();
    }

    protected deactivate() {
        this.active = false;
        this.midiEvents = [];
    }

    protected handleMidiIn({ status, data1, data2 }: MidiEvent) {
        println(JSON.stringify({ status, data1, data2 }));
    }

    protected addEvent(midiEvent: MidiEvent) {
        const { active } = this;
        if (active) {
            this.midiEvents.push(midiEvent);
        }
    }

    protected clearPads() {
        for (let pad = 0; pad < 64; pad++) {
            this.addEvent({
                status: 144,
                data1: pad,
                data2: BUTTON_COLOR.OFF,
            });
        }
    }
}

class ApcKeyboard extends ApcBase {
    private readonly noteInput: API.NoteInput;
    private readonly documentSettings: KeyboardSettings;
    private readonly globalSettings: KeyboardSettings;

    private keyPads: KeyboardPad[] = [];
    private armPads: ArmedPad[] = [];
    private bank: API.TrackBank;

    private root: ROOT_NOTE = ROOT_NOTE.C;
    private scale: SCALE = SCALE.MAJOR;
    private octave: Octave = DEFINED_OCTAVES[0];

    constructor(
        deviceIdx: number,
        midiIn: API.MidiIn,
        midiOut: API.MidiOut,
        settings: API.DocumentState,
        preferences: API.Preferences,
        bank: API.TrackBank
    ) {
        super(deviceIdx, midiIn, midiOut);
        this.bank = bank;
        this.armPads = BOTTOM_ROW.map((item) => {
            return {
                ...item,
                armed: false,
            };
        });

        const noteInput = midiIn.createNoteInput(
            `APC-Keyboard-${deviceIdx}`,
            createKeyboardFilter()
        );
        noteInput.includeInAllInputs();
        noteInput.setShouldConsumeEvents(false);
        this.noteInput = noteInput;
        this.setTranslationTable();

        const globalSettings = this.setSettings(preferences);
        const documentSettings = this.setSettings(settings);

        this.documentSettings = documentSettings;
        this.globalSettings = globalSettings;

        this.registerArmChange(bank);
        this.registerSettingsChange(documentSettings);
        this.registerSettingsChange(globalSettings);
    }

    public activate() {
        super.activate();
        this.renderArmed();
        this.renderKeyboard();
        this.setTranslationTable();
    }

    public deactivate() {
        super.deactivate();
        this.setTranslationTable();
    }

    public handleMidiIn({ status, data1, data2 }: MidiEvent) {
        super.handleMidiIn({ status, data1, data2 });
        const { armPads, bank } = this;
        if (this.isActive()) {
            if (
                status === 144 &&
                data1 >= BOTTOM_ROW_START &&
                data1 < BOTTOM_ROW_START + 8
            ) {
                const idx = data1 - BOTTOM_ROW_START;
                const { armed } = armPads[idx];
                const track = bank.getItemAt(idx);
                // !armed
                //     ? track.addNoteSource(noteInput)
                //     : track.removeNoteSource(noteInput);
                track.arm().set(!armed);
            }
            if (!this.isShift()) {
                if (
                    (status === 144 || status === 128) &&
                    data1 >= 0 &&
                    data1 < 64
                ) {
                    this.renderMatchedPads(data1, status === 144);
                    return;
                }
            }
            if (status === 144) {
                const rootNoteButton = ROOT_SETTINGS_LAYOU.find(
                    ({ pad }) => pad === data1
                );
                const scaleNoteButton = SCALE_SETTINGS_LAYOUT.find(
                    ({ pad }) => pad === data1
                );
                const octaveNoteButton = OCTAVE_SETTINGS_LAYOUT.find(
                    ({ pad }) => pad === data1
                );
                if (rootNoteButton) {
                    this.setRoot(rootNoteButton.root);
                }
                if (scaleNoteButton) {
                    this.setScale(scaleNoteButton.scale);
                }
                if (octaveNoteButton) {
                    this.setOctave(octaveNoteButton.octave);
                }
            }
        }
    }

    public setShift(s: boolean) {
        super.setShift(s);
        this.clearPads();
        this.setTranslationTable();
        if (s) {
            this.renderSettings();
            return;
        }
        this.renderKeyboard();
    }

    private setScale(newScale: SCALE) {
        const { scale, globalSettings, documentSettings } = this;
        if (newScale !== scale) {
            this.scale = newScale;
            this.setTranslationTable();
            this.renderScaleSettings();
            host.showPopupNotification(`SCALE: ${newScale}`);
        }
        if (globalSettings.scaleSettings.get() !== newScale) {
            globalSettings.scaleSettings.set(newScale);
        }
        if (documentSettings.scaleSettings.get() !== newScale) {
            documentSettings.scaleSettings.set(newScale);
        }
    }

    private setRoot(newRoot: ROOT_NOTE) {
        const { root, globalSettings, documentSettings } = this;
        if (newRoot !== root) {
            this.root = newRoot;
            this.setTranslationTable();
            this.renderRootSettings();
            host.showPopupNotification(`ROOT: ${newRoot}`);
        }
        if (globalSettings.rootNoteSettings.get() !== newRoot) {
            globalSettings.rootNoteSettings.set(newRoot);
        }
        if (documentSettings.rootNoteSettings.get() !== newRoot) {
            documentSettings.rootNoteSettings.set(newRoot);
        }
    }

    private setOctave(newOctave: Octave) {
        const { octave, globalSettings, documentSettings } = this;
        if (newOctave !== octave) {
            this.octave = newOctave;
            this.setTranslationTable();
            this.renderOctaveSettings();
            host.showPopupNotification(`OCTAVE: ${newOctave}`);
        }
        if (globalSettings.octaveSettings.get() !== newOctave) {
            globalSettings.octaveSettings.set(newOctave);
        }
        if (documentSettings.octaveSettings.get() !== newOctave) {
            documentSettings.octaveSettings.set(newOctave);
        }
    }

    private registerSettingsChange({
        octaveSettings,
        rootNoteSettings,
        scaleSettings,
    }: KeyboardSettings) {
        scaleSettings.addValueObserver((v) => this.setScale(v as SCALE));
        rootNoteSettings.addValueObserver((v) => this.setRoot(v as ROOT_NOTE));
        octaveSettings.addValueObserver((v) => this.setOctave(v as Octave));
    }

    private setSettings(
        setting: API.Preferences | API.DocumentState
    ): KeyboardSettings {
        const { deviceIdx, octave, scale } = this;
        const cat = `Scales - ${deviceIdx}`;
        const scaleSettings = setting.getEnumSetting(
            'Scale',
            cat,
            DEFINED_SCALES as any,
            scale
        );
        scaleSettings.markInterested();

        const rootNoteSettings = setting.getEnumSetting(
            'ROOT Note',
            cat,
            DEFINED_ROOTS as any,
            ROOT_NOTE.C
        );
        rootNoteSettings.markInterested();

        const octaveSettings = setting.getEnumSetting(
            'Octave',
            cat,
            DEFINED_OCTAVES as any,
            octave
        );
        octaveSettings.markInterested();

        return {
            octaveSettings,
            rootNoteSettings,
            scaleSettings,
        };
    }

    private setArmed(idx: number, armed: boolean) {
        const oldPad = this.armPads[idx];
        const newPad = {
            ...oldPad,
            armed,
        };
        this.armPads[idx] = newPad;
        this.renderArmPad(newPad);
    }

    private renderArmPad({ pad, armed }: ArmedPad) {
        this.addEvent({
            status: 144,
            data1: pad,
            data2: armed ? BUTTON_COLOR.GREEN : BUTTON_COLOR.OFF,
        });
    }

    private renderArmed() {
        const { armPads } = this;
        armPads.forEach((pad) => this.renderArmPad(pad));
    }

    private registerArmChange(bank: API.TrackBank) {
        const size = bank.getSizeOfBank();
        for (let c = 0; c < size; c++) {
            const track = bank.getItemAt(c);
            const arm = track.arm();
            arm.addValueObserver((armed) => {
                this.setArmed(c, armed);
            });
        }
    }

    private renderKeyboard() {
        const { keyPads } = this;
        keyPads.forEach((pad) => {
            this.renderPadOff(pad);
        });
    }

    private renderRootSettings() {
        if (this.isActive() && this.isShift()) {
            ROOT_SETTINGS_LAYOU.forEach(({ pad, root }) => {
                this.renderPadOff({
                    isRoot: root === this.root,
                    pad: pad,
                    note: -1,
                });
            });
        }
    }

    private renderOctaveSettings() {
        if (this.isActive() && this.isShift()) {
            OCTAVE_SETTINGS_LAYOUT.forEach(({ pad, octave }) => {
                this.renderPadOff({
                    isRoot: octave === this.octave,
                    pad: pad,
                    note: -1,
                });
            });
        }
    }

    private renderScaleSettings() {
        if (this.isActive() && this.isShift()) {
            SCALE_SETTINGS_LAYOUT.forEach(({ pad, scale }) => {
                this.renderPadOff({
                    isRoot: scale === this.scale,
                    pad: pad,
                    note: -1,
                });
            });
        }
    }

    private renderSettings() {
        this.renderRootSettings();
        this.renderOctaveSettings();
        this.renderScaleSettings();
    }

    private renderPadOff({ isRoot, pad }: KeyboardPad) {
        this.addEvent({
            status: 144,
            data1: pad,
            data2: isRoot ? BUTTON_COLOR.RED : BUTTON_COLOR.ORANGE,
        });
    }

    private renderPadOn({ pad }: KeyboardPad) {
        this.addEvent({
            status: 144,
            data1: pad,
            data2: BUTTON_COLOR.GREEN,
        });
    }

    private setTranslationTable() {
        const { scale, root, octave } = this;
        const { noteInput } = this;
        const pads: KeyboardPad[] = [];
        const table: number[] = [];
        for (let pad = 0; pad < 128; pad++) {
            if (pad < 64) {
                const { note, isRoot } = mapPadToScale(
                    pad,
                    root,
                    octave,
                    scale,
                    this.isActive(),
                    this.isShift()
                );

                pads.push({
                    note,
                    isRoot,
                    pad,
                });

                table.push(note);
            } else {
                table.push(-1);
            }
        }
        this.keyPads = pads;
        noteInput.setKeyTranslationTable(table);
    }

    private renderMatchedPads(padNum: number, active: boolean) {
        const { keyPads } = this;
        const { note } = keyPads[padNum];
        const matchedPads = keyPads.filter((pad) => pad.note === note);
        matchedPads.forEach((item) => {
            active === true ? this.renderPadOn(item) : this.renderPadOff(item);
        });
    }
}

class ApcMini {
    private readonly keyboard: ApcKeyboard;

    constructor(deviceIdx: number) {
        const midiIn = host.getMidiInPort(deviceIdx);
        const midiOut = host.getMidiOutPort(deviceIdx);
        const settings = host.getDocumentState();
        const preferences = host.getPreferences();

        const bank = host.createTrackBank(GRID_SIZE, SENDS, GRID_SIZE);
        bank.setShouldShowClipLauncherFeedback(true);

        this.keyboard = new ApcKeyboard(
            deviceIdx,
            midiIn,
            midiOut,
            settings,
            preferences,
            bank
        );
        this.keyboard.activate();

        const surface = host.createHardwareSurface();

        this.registerShift(deviceIdx, midiIn, surface);

        midiIn.setMidiCallback((status, data1, data2) =>
            this.handleMidiIn({ status, data1, data2 })
        );
        println('started');
    }

    private registerShift(
        deviceIdx: number,
        midiIn: API.MidiIn,
        surface: API.HardwareSurface
    ) {
        const shiftButton = surface.createHardwareButton(
            `APC-BUTTON-${deviceIdx}-${BUTTON.SHIFT}`
        );

        shiftButton
            .pressedAction()
            .setActionMatcher(
                midiIn.createNoteOnActionMatcher(0, BUTTON.SHIFT)
            );

        shiftButton
            .releasedAction()
            .setActionMatcher(
                midiIn.createNoteOffActionMatcher(0, BUTTON.SHIFT)
            );

        shiftButton.isPressed().addValueObserver((v) => {
            this.setShift(v);
        });
    }

    public flush() {
        this.keyboard.flush();
    }

    private setShift(v: boolean) {
        this.keyboard.setShift(v);
    }

    private handleMidiIn(midiEvent: MidiEvent) {
        this.keyboard.handleMidiIn(midiEvent);
    }
}

const controllers: ApcMini[] = [];

async function init() {
    host.getNotificationSettings().getUserNotificationsEnabled().set(true);
    for (let i = 0; i < MIDI_PORTS; i++) {
        controllers.push(new ApcMini(i));
    }
}

function flush() {
    controllers.forEach((c) => {
        c.flush();
    });
    println('flushed');
}

function exit() {
    println('exited');
}
