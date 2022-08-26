import { Constants, Enums, Types } from '@drakh-bitwig/shared';
import PianoKeyboard from './PianoKeyboard';
import Sidebar from './Sidebar';
import ClipLauncher from './ClipLauncher';

export default class ControllerControl {
    private readonly keyboard: PianoKeyboard;
    private readonly sidebar: Sidebar;
    private readonly launcher: ClipLauncher;

    private mode: Enums.CONTROLLER_MODE = Enums.CONTROLLER_MODE.KEYBOARD;

    constructor(deviceIdx: number) {
        const { mode } = this;

        const midiIn = host.getMidiInPort(deviceIdx);
        const midiOut = host.getMidiOutPort(deviceIdx);
        const settings = host.getDocumentState();
        const preferences = host.getPreferences();
        const bank = host.createTrackBank(
            Constants.GRID_SIZE,
            Constants.SENDS,
            Constants.GRID_SIZE
        );
        const sceneBank = host.createSceneBank(Constants.GRID_SIZE);
        const surface = host.createHardwareSurface();
        const modePreferences = preferences.getEnumSetting(
            `Mode - ${deviceIdx}`,
            `Global`,
            Constants.DEFINED_MODES,
            mode
        );

        this.sidebar = new Sidebar(
            deviceIdx,
            midiIn,
            midiOut,
            mode,
            bank,
            sceneBank,
            modePreferences
        );

        this.keyboard = new PianoKeyboard(
            deviceIdx,
            midiIn,
            midiOut,
            settings,
            preferences,
            bank
        );

        this.launcher = new ClipLauncher(deviceIdx, midiIn, midiOut, bank);

        bank.setShouldShowClipLauncherFeedback(true);
        sceneBank.setIndication(true);

        this.registerShift(deviceIdx, midiIn, surface);

        modePreferences.addValueObserver((v) => {
            this.setMode(v as Enums.CONTROLLER_MODE);
        });

        this.activateCurrentMode();

        midiIn.setMidiCallback((status, data1, data2) =>
            this.handleMidiIn({ status, data1, data2 })
        );
        println('started');
    }

    private setMode(mode: Enums.CONTROLLER_MODE) {
        this.mode = mode;
        this.activateCurrentMode();
    }

    private activateCurrentMode() {
        const { mode, keyboard, launcher, sidebar } = this;
        switch (mode) {
            case Enums.CONTROLLER_MODE.LAUNCHER:
                launcher.activate();
                keyboard.deactivate();
                break;
            case Enums.CONTROLLER_MODE.KEYBOARD:
                launcher.deactivate();
                keyboard.activate();
                break;
        }
        sidebar.setMode(mode);
    }

    private registerShift(
        deviceIdx: number,
        midiIn: API.MidiIn,
        surface: API.HardwareSurface
    ) {
        const shiftButton = surface.createHardwareButton(
            `APC-BUTTON-${deviceIdx}-${Enums.BUTTON.SHIFT}`
        );

        shiftButton
            .pressedAction()
            .setActionMatcher(
                midiIn.createNoteOnActionMatcher(0, Enums.BUTTON.SHIFT)
            );

        shiftButton
            .releasedAction()
            .setActionMatcher(
                midiIn.createNoteOffActionMatcher(0, Enums.BUTTON.SHIFT)
            );

        shiftButton.isPressed().addValueObserver((v) => {
            this.setShift(v);
        });
    }

    public flush() {
        const { sidebar, keyboard, launcher, mode } = this;
        mode === Enums.CONTROLLER_MODE.KEYBOARD
            ? keyboard.flush()
            : launcher.flush();
        sidebar.flush();
    }

    private setShift(v: boolean) {
        const { sidebar, keyboard, launcher, mode } = this;
        mode === Enums.CONTROLLER_MODE.KEYBOARD
            ? keyboard.setShift(v)
            : launcher.setShift(v);
        sidebar.setShift(v);
    }

    private handleMidiIn(midiEvent: Types.MidiEvent) {
        const { sidebar, keyboard, launcher, mode } = this;
        mode === Enums.CONTROLLER_MODE.KEYBOARD
            ? keyboard.handleMidiIn(midiEvent)
            : launcher.handleMidiIn(midiEvent);
        sidebar.handleMidiIn(midiEvent);
    }
}
