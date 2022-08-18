loadAPI(17);
host.setShouldFailOnDeprecatedUse(true);

host.defineController(
    'Drakh',
    'AKAI APC mini two',
    '0.1',
    '605f2c30-c299-4bb6-a591-5a0b9f0a1c20',
    'drakh'
);

const deviceNames = [
    'APC MINI',
    // 'APC MINI #2'
];

const gridSize = 6;
const sends = 3;

enum DeviceMode {
    launcher = 'LAUNCHER',
    keyboard = 'KEYBOARD',
}

const midiPorts = deviceNames.length;

host.defineMidiPorts(midiPorts, midiPorts);

host.addDeviceNameBasedDiscoveryPair(deviceNames, deviceNames);

interface PadState {
    armed: boolean;
    changed: boolean;
    empty: boolean;
    playing: boolean;
    toPlay: boolean;
    isGroup: boolean;
    isGroupExpanded: boolean;
    note: number;
    c: number;
    r: number;
}

type UpdateState = Partial<Omit<PadState, 'c, r, note'>>;

class ApcMini {
    private launcherPads: PadState[] = [];

    private mode: DeviceMode = DeviceMode.launcher;

    private deviceIdx: number;
    private midiIn: API.MidiIn;
    private midiOut: API.MidiOut;
    private bank: API.TrackBank;
    private scenes: API.SceneBank;
    private noteInput?: API.NoteInput;
    private isShift: boolean = false;

    constructor(deviceIdx: number) {
        this.deviceIdx = deviceIdx;
        this.midiIn = host.getMidiInPort(deviceIdx);
        this.midiOut = host.getMidiOutPort(deviceIdx);

        this.noteInput = this.midiIn.createNoteInput(`API-mini-${deviceIdx}`);

        const bank = host.createTrackBank(gridSize, sends, gridSize);
        bank.setShouldShowClipLauncherFeedback(true);
        const sbnk = host.createSceneBank(gridSize);
        sbnk.setIndication(true);
        this.scenes = sbnk;
        this.bank = bank;

        this.init();
    }

    public render() {
        const { mode } = this;
        const { midiOut, launcherPads } = this;
        switch (mode) {
            case DeviceMode.launcher:
                launcherPads.forEach((pad) => {
                    const { note, empty, playing, isGroup, toPlay } = pad;
                    const stopedCode = isGroup === true ? 3 : 5;
                    const playingCode = isGroup === true ? 2 : 1;
                    const emptyCode = isGroup === true ? 6 : 0;
                    const goingToPlayCode = isGroup === true ? 4 : 6;
                    if (empty) {
                        midiOut.sendMidi(144, note, emptyCode);
                        return;
                    }

                    if (toPlay) {
                        midiOut.sendMidi(144, note, goingToPlayCode);
                        return;
                    }
                    midiOut.sendMidi(
                        144,
                        note,
                        playing ? playingCode : stopedCode
                    );
                });
                break;
        }
    }

    private async init() {
        for (let c = 0; c < 8; c++) {
            for (let r = 0; r < 8; r++) {
                this.midiOut.sendMidi(144, 56 + c - 8 * r, 0);
            }
        }
        this.register();
        this.midiIn.setMidiCallback((status, data1) =>
            this.onMidiIn(status, data1)
        );
    }

    public unregister() {
        const { bank } = this;
        const scene = bank.sceneBank();

        scene.unsubscribe();
        bank.unsubscribe();
    }

    private register() {
        const { bank, midiOut, launcherPads } = this;
        const scene = bank.sceneBank();

        scene.canScrollBackwards().addValueObserver((b) => {
            midiOut.sendMidi(144, 83, b === true ? 127 : 0);
        });
        scene.canScrollForwards().addValueObserver((b) => {
            midiOut.sendMidi(144, 84, b === true ? 127 : 0);
        });
        bank.canScrollBackwards().addValueObserver((b) => {
            midiOut.sendMidi(144, 86, b === true ? 127 : 0);
        });
        bank.canScrollForwards().addValueObserver((b) => {
            midiOut.sendMidi(144, 85, b === true ? 127 : 0);
        });

        const colSize = bank.getSizeOfBank();

        for (let c = 0; c < colSize; c++) {
            const col = bank.getItemAt(c);

            const rows = col.clipLauncherSlotBank();
            const rowsSize = rows.getSizeOfBank();
            for (let r = 0; r < rowsSize; r++) {
                launcherPads.push({
                    armed: false,
                    changed: false,
                    playing: false,
                    empty: false,
                    isGroup: false,
                    isGroupExpanded: false,
                    toPlay: false,
                    note: 56 + c - r * 8,
                    c,
                    r,
                });

                const cell = rows.getItemAt(r);

                cell.hasContent().addValueObserver((b) => {
                    this.setState(
                        {
                            empty: !b,
                        },
                        c,
                        r
                    );
                });

                cell.isPlaying().addValueObserver((b) => {
                    this.setState(
                        {
                            playing: b,
                        },
                        c,
                        r
                    );
                });

                cell.isPlaybackQueued().addValueObserver((b) => {
                    this.setState(
                        {
                            toPlay: b,
                        },
                        c,
                        r
                    );
                });
            }

            col.isGroup().addValueObserver((isGroup) => {
                this.setColState({ isGroup }, c);
            });
            col.isGroupExpanded().markInterested();

            const arm = col.arm();

            arm.addValueObserver((armed) => {
                this.setColState({ armed }, c);
            });

            col.isStopped().addValueObserver((b) => {
                // midiOut.sendMidi(144, 64 + c, b === true ? 0 : 127);
            });
        }
    }

    private launchClip(c: number, r: number) {
        const { bank } = this;
        bank.getItemAt(c).clipLauncherSlotBank().getItemAt(r).launch();
    }

    private stopTrack(c) {
        const { bank } = this;
        bank.getItemAt(c).stop();
    }

    private setColState(newState: UpdateState, c: number) {
        const oldPads = this.launcherPads;
        this.launcherPads = oldPads.map((pad) => {
            if (pad.c === c) {
                return {
                    ...pad,
                    ...newState,
                    changed: true,
                };
            }
            return pad;
        });
    }

    private setState(newState: UpdateState, c: number, r: number) {
        const oldPads = this.launcherPads;
        this.launcherPads = oldPads.map((pad) => {
            if (pad.c === c && pad.r === r) {
                return {
                    ...pad,
                    ...newState,
                    changed: true,
                };
            }
            return pad;
        });
    }

    private toggleExpand(c: number) {
        const { bank } = this;
        const expanded = bank.getItemAt(c).isGroupExpanded().get();
        bank.getItemAt(c).isGroupExpanded().set(!expanded);
    }

    private onMidiIn(status: number, data1: number) {
        const { bank, scenes, launcherPads, mode } = this;
        const scene = bank.sceneBank();
        println(JSON.stringify({ status, data1 }));

        switch (mode) {
            case DeviceMode.launcher:
                switch (status) {
                    case 144:
                        switch (data1) {
                            case 89:
                                scenes.stop();
                                break;
                            case 98:
                                this.isShift = true;
                                break;
                            case 83:
                                scene.scrollPageBackwards();
                                scenes.scrollPageBackwards();
                                break;
                            case 84:
                                scene.scrollPageForwards();
                                scenes.scrollPageForwards();
                                break;
                            case 86:
                                bank.scrollPageBackwards();
                                break;
                            case 85:
                                bank.scrollPageForwards();
                                break;
                            default:
                                if (data1 >= 64 && data1 < 64 + gridSize) {
                                    const c = data1 - 64;
                                    if (!this.isShift) {
                                        this.stopTrack(c);
                                        return;
                                    }
                                    this.toggleExpand(c);
                                }
                                const pad = launcherPads.find(
                                    (pad) => pad.note === data1
                                );
                                if (pad) {
                                    const { c, r, isGroup } = pad;
                                    if (!this.isShift) {
                                        this.launchClip(c, r);
                                        return;
                                    }
                                    if (isGroup) {
                                        this.toggleExpand(c);
                                        return;
                                    }
                                }
                                break;
                        }
                        // this.noteInput.sendRawMidiEvent(status, data1, data2);
                        break;
                    case 128:
                        switch (data1) {
                            case 98:
                                this.isShift = false;
                                break;
                        }
                        break;
                }
                break;
            case DeviceMode.keyboard:
                break;
        }
    }
}

const controllers: ApcMini[] = [];

async function init() {
    // const app = host.createApplication();
    for (let i = 0; i < midiPorts; i++) {
        controllers.push(new ApcMini(i));
    }
    println('test initialized!');
}

function flush() {
    controllers.forEach((c) => {
        c.render();
    });
    println('flushed');
}

function exit() {
    controllers.forEach((c) => {
        c.unregister();
    });
    println('exited');
}
