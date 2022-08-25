import { PadsBase } from './PadsBase';
import { OnOffPad, MidiEvent } from '../types';
import { CONTROLLER_MODE, BUTTON, EVENT_STATUS } from '../enums';

export class Sidebar extends PadsBase {
    private readonly modePreferences: API.SettableEnumValue;
    private readonly mainScene: API.SceneBank;
    private readonly bank: API.TrackBank;
    private readonly bankScene: API.SceneBank;

    private mode: CONTROLLER_MODE = CONTROLLER_MODE.KEYBOARD;
    private navigationPads: OnOffPad[] = [
        { pad: BUTTON.UP, on: false },
        { pad: BUTTON.DOWN, on: false },
        { pad: BUTTON.LEFT, on: false },
        { pad: BUTTON.RIGHT, on: false },
        { pad: BUTTON.SWITCH_TO_KEYBOARD, on: false },
        { pad: BUTTON.SWICTH_TO_LAUNCHER, on: false },
        { pad: 88, on: false },
        { pad: BUTTON.STOP_ALL, on: true },
    ];
    private sceneStatePads: OnOffPad[] = [
        { pad: 82, on: true },
        { pad: 83, on: true },
        { pad: 84, on: true },
        { pad: 85, on: true },
        { pad: 86, on: true },
        { pad: 87, on: true },
        { pad: 88, on: true },
        { pad: 89, on: true },
    ];

    constructor(
        deviceIdx: number,
        midiIn: API.MidiIn,
        midiOut: API.MidiOut,
        mode: CONTROLLER_MODE,
        bank: API.TrackBank,
        mainScene: API.SceneBank,
        modePreferences: API.SettableEnumValue
    ) {
        super(deviceIdx, midiIn, midiOut);
        const bankScene = bank.sceneBank();
        this.mode = mode;
        this.modePreferences = modePreferences;
        this.mainScene = mainScene;
        this.bank = bank;
        this.bankScene = bankScene;

        bank.canScrollBackwards().addValueObserver((on) => {
            this.setPad({ pad: BUTTON.LEFT, on });
        });
        bank.canScrollForwards().addValueObserver((on) => {
            this.setPad({ pad: BUTTON.RIGHT, on });
        });

        bankScene.canScrollBackwards().addValueObserver((on) => {
            this.setPad({ pad: BUTTON.UP, on });
        });
        bankScene.canScrollForwards().addValueObserver((on) => {
            this.setPad({ pad: BUTTON.DOWN, on });
        });

        this.activate();
    }

    setPad(newPad: OnOffPad) {
        const { navigationPads } = this;
        this.navigationPads = navigationPads.map(({ pad, on }) => {
            if (pad === newPad.pad) {
                return newPad;
            }
            return { pad, on };
        });
        this.render();
    }

    public setShift(s: boolean) {
        super.setShift(s);
        this.render();
    }

    public handleMidiIn({ status, data1, data2 }: MidiEvent) {
        super.handleMidiIn({ status, data1, data2 }, 'sidebar');

        const { modePreferences, mainScene, bank, bankScene } = this;

        if (status === EVENT_STATUS.NOTE_ON) {
            if (this.isShift()) {
                if (data1 >= 82 && data1 < 82 + 8) {
                    const sceneIdx = data1 - 82;
                    mainScene.getItemAt(sceneIdx).launch();
                    return;
                }
                return;
            }
            if (data1 === BUTTON.STOP_ALL) {
                mainScene.stop();
                return;
            }
            if (data1 === BUTTON.SWICTH_TO_LAUNCHER) {
                modePreferences.set(CONTROLLER_MODE.LAUNCHER);
                return;
            }
            if (data1 === BUTTON.SWITCH_TO_KEYBOARD) {
                modePreferences.set(CONTROLLER_MODE.KEYBOARD);
                return;
            }
            if (data1 === BUTTON.DOWN) {
                bankScene.scrollPageForwards();
                mainScene.scrollPageForwards();
            }
            if (data1 === BUTTON.UP) {
                bankScene.scrollPageBackwards();
                mainScene.scrollPageBackwards();
            }
            if (data1 === BUTTON.RIGHT) {
                bank.scrollPageForwards();
            }
            if (data1 === BUTTON.LEFT) {
                bank.scrollPageBackwards();
            }
        }
    }

    public setMode(mode: CONTROLLER_MODE) {
        this.mode = mode;
        this.setPad({
            pad: BUTTON.SWICTH_TO_LAUNCHER,
            on: mode === CONTROLLER_MODE.KEYBOARD,
        });
        this.setPad({
            pad: BUTTON.SWITCH_TO_KEYBOARD,
            on: mode === CONTROLLER_MODE.LAUNCHER,
        });
    }

    protected activate() {
        super.activate();
        this.render();
    }

    private render() {
        const { navigationPads, sceneStatePads } = this;
        const padsToRender = this.isShift() ? sceneStatePads : navigationPads;
        padsToRender.forEach((pad) => this.renderOnOffPad(pad));
    }
}
