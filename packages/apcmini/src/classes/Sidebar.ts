import { Enums, Types } from '@drakh-bitwig/shared';
import PadsBase from './PadsBase';

export default class Sidebar extends PadsBase {
    private readonly modePreferences: API.SettableEnumValue;
    private readonly mainScene: API.SceneBank;
    private readonly bank: API.TrackBank;
    private readonly bankScene: API.SceneBank;

    private mode: Enums.CONTROLLER_MODE = Enums.CONTROLLER_MODE.KEYBOARD;
    private navigationPads: Types.OnOffPad[] = [
        { pad: Enums.BUTTON.UP, on: false },
        { pad: Enums.BUTTON.DOWN, on: false },
        { pad: Enums.BUTTON.LEFT, on: false },
        { pad: Enums.BUTTON.RIGHT, on: false },
        { pad: Enums.BUTTON.SWITCH_TO_KEYBOARD, on: false },
        { pad: Enums.BUTTON.SWICTH_TO_LAUNCHER, on: false },
        { pad: 88, on: false },
        { pad: Enums.BUTTON.STOP_ALL, on: true },
    ];
    private sceneStatePads: Types.OnOffPad[] = [
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
        mode: Enums.CONTROLLER_MODE,
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
            this.setPad({ pad: Enums.BUTTON.LEFT, on });
        });
        bank.canScrollForwards().addValueObserver((on) => {
            this.setPad({ pad: Enums.BUTTON.RIGHT, on });
        });

        bankScene.canScrollBackwards().addValueObserver((on) => {
            this.setPad({ pad: Enums.BUTTON.UP, on });
        });
        bankScene.canScrollForwards().addValueObserver((on) => {
            this.setPad({ pad: Enums.BUTTON.DOWN, on });
        });

        this.activate();
    }

    setPad(newPad: Types.OnOffPad) {
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

    public handleMidiIn({ status, data1, data2 }: Types.MidiEvent) {
        super.handleMidiIn({ status, data1, data2 }, 'sidebar');

        const { modePreferences, mainScene, bank, bankScene } = this;

        if (status === Enums.EVENT_STATUS.NOTE_ON) {
            if (this.isShift()) {
                if (data1 >= 82 && data1 < 82 + 8) {
                    const sceneIdx = data1 - 82;
                    mainScene.getItemAt(sceneIdx).launch();
                    return;
                }
                return;
            }
            if (data1 === Enums.BUTTON.STOP_ALL) {
                mainScene.stop();
                return;
            }
            if (data1 === Enums.BUTTON.SWICTH_TO_LAUNCHER) {
                modePreferences.set(Enums.CONTROLLER_MODE.LAUNCHER);
                return;
            }
            if (data1 === Enums.BUTTON.SWITCH_TO_KEYBOARD) {
                modePreferences.set(Enums.CONTROLLER_MODE.KEYBOARD);
                return;
            }
            if (data1 === Enums.BUTTON.DOWN) {
                bankScene.scrollPageForwards();
                mainScene.scrollPageForwards();
            }
            if (data1 === Enums.BUTTON.UP) {
                bankScene.scrollPageBackwards();
                mainScene.scrollPageBackwards();
            }
            if (data1 === Enums.BUTTON.RIGHT) {
                bank.scrollPageForwards();
            }
            if (data1 === Enums.BUTTON.LEFT) {
                bank.scrollPageBackwards();
            }
        }
    }

    public setMode(mode: Enums.CONTROLLER_MODE) {
        this.mode = mode;
        this.setPad({
            pad: Enums.BUTTON.SWICTH_TO_LAUNCHER,
            on: mode === Enums.CONTROLLER_MODE.KEYBOARD,
        });
        this.setPad({
            pad: Enums.BUTTON.SWITCH_TO_KEYBOARD,
            on: mode === Enums.CONTROLLER_MODE.LAUNCHER,
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
