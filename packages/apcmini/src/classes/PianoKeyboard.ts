import { PadsBase } from './PadsBase';
import {
    KeyboardSettings,
    KeyboardPad,
    OnOffPad,
    Octave,
    MidiEvent,
} from '../types';
import { ROOT_NOTE, SCALE, EVENT_STATUS } from '../enums';
import {
    DEFINED_SCALES,
    DEFINED_OCTAVES,
    BOTTOM_ROW,
    BOTTOM_ROW_START,
    GRID_SIZE,
    ROOT_SETTINGS_LAYOUT,
    SCALE_SETTINGS_LAYOUT,
    OCTAVE_SETTINGS_LAYOUT,
    DEFINED_ROOTS,
} from '../constants';
import { createKeyboardFilter, mapPadToScale } from '../utils';

export class PianoKeyboard extends PadsBase {
    private readonly noteInput: API.NoteInput;
    private readonly documentSettings: KeyboardSettings;
    private readonly globalSettings: KeyboardSettings;

    private keyPads: KeyboardPad[] = [];
    private armPads: OnOffPad[] = [];
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
                on: false,
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
        super.handleMidiIn({ status, data1, data2 }, 'keyboard');
        const { armPads, bank } = this;
        if (this.isActive()) {
            if (
                status === EVENT_STATUS.NOTE_ON &&
                data1 >= BOTTOM_ROW_START &&
                data1 < BOTTOM_ROW_START + GRID_SIZE
            ) {
                const idx = data1 - BOTTOM_ROW_START;
                const { on } = armPads[idx];
                const track = bank.getItemAt(idx);
                track.arm().set(!on);
            }
            if (!this.isShift()) {
                if (
                    (status === EVENT_STATUS.NOTE_ON ||
                        status === EVENT_STATUS.NOTE_OFF) &&
                    data1 >= 0 &&
                    data1 < 64
                ) {
                    this.renderMatchedPads(
                        data1,
                        status === EVENT_STATUS.NOTE_ON
                    );
                    return;
                }
            }
            if (status === EVENT_STATUS.NOTE_ON) {
                const rootNoteButton = ROOT_SETTINGS_LAYOUT.find(
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
        const newPad: OnOffPad = {
            ...oldPad,
            on: armed,
        };
        this.armPads[idx] = newPad;
        this.renderArmPad(newPad);
    }

    private renderArmPad({ pad, on }: OnOffPad) {
        on ? this.renderPadOn({ pad }) : this.renderPadOff({ pad });
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
            this.renderKeyPadOff(pad);
        });
    }

    private renderRootSettings() {
        if (this.isActive() && this.isShift()) {
            ROOT_SETTINGS_LAYOUT.forEach(({ pad, root }) => {
                root === this.root
                    ? this.renderPadRed({ pad })
                    : this.renderPadOrange({ pad });
            });
        }
    }

    private renderOctaveSettings() {
        if (this.isActive() && this.isShift()) {
            OCTAVE_SETTINGS_LAYOUT.forEach(({ pad, octave }) => {
                octave === this.octave
                    ? this.renderPadRed({ pad })
                    : this.renderPadOrange({ pad });
            });
        }
    }

    private renderScaleSettings() {
        if (this.isActive() && this.isShift()) {
            SCALE_SETTINGS_LAYOUT.forEach(({ pad, scale }) => {
                scale === this.scale
                    ? this.renderPadRed({ pad })
                    : this.renderPadOrange({ pad });
            });
        }
    }

    private renderSettings() {
        this.renderRootSettings();
        this.renderOctaveSettings();
        this.renderScaleSettings();
    }

    private renderKeyPadOff({ isRoot, pad }: KeyboardPad) {
        isRoot ? this.renderPadRed({ pad }) : this.renderPadOrange({ pad });
    }

    private renderKeyPadOn({ pad }: KeyboardPad) {
        this.renderPadOn({ pad });
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
            active === true
                ? this.renderKeyPadOn(item)
                : this.renderKeyPadOff(item);
        });
    }
}
