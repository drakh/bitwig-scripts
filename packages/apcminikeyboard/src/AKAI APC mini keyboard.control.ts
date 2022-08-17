loadAPI(17);
host.setShouldFailOnDeprecatedUse(true);

host.defineController("Drakh", "AKAI APC mini keyboard", "0.1", "afe40d74-df95-4637-9a79-6f773aa7fc64", "drakh");

const deviceNames = [
    'APC MINI',
    // 'APC MINI #2'
];

const gridSize = 8;
const sends = 3;

const midiPorts = deviceNames.length;

host.defineMidiPorts(midiPorts, midiPorts);

host.addDeviceNameBasedDiscoveryPair(deviceNames, deviceNames);


interface Pad {
    key: number;
    note: number;
}

class ApcMini {
    private readonly deviceIdx: number;
    private readonly midiIn: API.MidiIn;
    private readonly midiOut: API.MidiOut;
    private readonly bank: API.TrackBank;
    private readonly noteInput: API.NoteInput;
    private readonly surface: API.HardwareSurface;

    private isShift: boolean = false;

    private Pads: Pad[] = [];

    constructor(deviceIdx: number) {
        this.deviceIdx = deviceIdx;
        this.midiIn = host.getMidiInPort(deviceIdx);
        this.midiOut = host.getMidiOutPort(deviceIdx);
        const surface = host.createHardwareSurface();
        const settings = host.getDocumentState();
        // const preferences = host.getPreferences();

        // preferences.getEnumSetting("Mode", "Global", ["Launcher", "Keyboard"] as any, "Launcher");

        const rootNote = settings.getEnumSetting("ROOT Note", "Scales", ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"] as any, "C");
        const scale = settings.getEnumSetting("Scale", "Scales", ["Major", "Minor"] as any, "Major");
        const octave = settings.getNumberSetting("Octave", "Scales", 0, 4, 1, "", 1);

        rootNote.markInterested();
        scale.markInterested();
        octave.markInterested();

        const r = rootNote.get();
        const sc = scale.get();
        const oct = octave.get();

        println(JSON.stringify({
            r,
            sc,
            oct
        }));

        rootNote.addValueObserver((v) => {
            println(`Root ${v}`)
        });
        scale.addValueObserver((v) => {
            println(`Scale ${v}`)
        });

        const args: string[] = [];
        const table: number[] = [];

        for (let i = 0; i < 64; i++) {
            this.midiOut.sendMidi(144, i, 0);
        }

        for (let i = 0; i < 128; i++) {
            const scale = [0, 2, 4, 5, 7, 9, 11];

            if (i < 64) {

                const p = `000${i.toString(16)}`.slice(-2);
                args.push(`80${p}??`);
                args.push(`90${p}??`);

                const c = i % gridSize;
                const r = Math.floor(i / gridSize);
                const n = r * 3 + c;
                const noteIndex = n % 7;
                const isRoot = noteIndex === 0;
                const octave = Math.floor(n / 7);
                const note = scale[noteIndex];

                this.midiOut.sendMidi(144, i, isRoot ? 3 : 5);

                table.push(note + 48 + (octave * 12));
            } else {
                table.push(-1)
            }
        }

        const noteInput = this.midiIn.createNoteInput(`API-mini-keyboard-${deviceIdx}`, args as any);
        noteInput.setShouldConsumeEvents(false);
        noteInput.includeInAllInputs().set(true);
        noteInput.setKeyTranslationTable(table);
        const piano = surface.createPianoKeyboard(`APC-mini-piano-${deviceIdx}`, 64, 0, 0);
        piano.setNoteInput(noteInput);

        this.surface = surface;
        this.noteInput = noteInput;
        const bank = host.createTrackBank(gridSize, sends, gridSize);
        bank.setShouldShowClipLauncherFeedback(true);
        this.bank = bank;

        this.register();
        println('controller initialised');
    }

    public render() {
    }

    private register() {
        const {bank, midiOut, midiIn} = this;
        // for (let c = 0; c < 8; c++) {
        //     for (let r = 0; r < 8; r++) {
        //         midiOut.sendMidi(144, (56 + c) - (8 * r), 0)
        //     }
        // }


        // const scene = bank.sceneBank();
        //
        // scene.canScrollBackwards().addValueObserver((b) => {
        //     midiOut.sendMidi(144, 83, b === true ? 127 : 0)
        // });
        // scene.canScrollForwards().addValueObserver((b) => {
        //     midiOut.sendMidi(144, 84, b === true ? 127 : 0)
        // });
        // bank.canScrollBackwards().addValueObserver((b) => {
        //     midiOut.sendMidi(144, 86, b === true ? 127 : 0)
        // });
        // bank.canScrollForwards().addValueObserver((b) => {
        //     midiOut.sendMidi(144, 85, b === true ? 127 : 0)
        // });
        //
        // const colSize = bank.getSizeOfBank();
        //
        // for (let c = 0; c < colSize; c++) {
        //     const col = bank.getItemAt(c);
        // }
        midiIn.setMidiCallback((status, data1, data2) => this.onMidiIn(status, data1, data2));
    }

    public unregister() {
    }

    private onMidiIn(status: number, data1: number, data2: number) {
        println(JSON.stringify({status, data1, data2}))
        // const {bank, scenes, launcherPads} = this;
        // const scene = bank.sceneBank();
        // println(JSON.stringify({status, data1}));
        //
        // switch (status) {
        //     case 144:
        //         switch (data1) {
        //             case 89:
        //                 scenes.stop();
        //                 break;
        //             case 98:
        //                 this.isShift = true;
        //                 break;
        //             case 83:
        //                 scene.scrollPageBackwards();
        //                 scenes.scrollPageBackwards();
        //                 break;
        //             case 84:
        //                 scene.scrollPageForwards();
        //                 scenes.scrollPageForwards();
        //                 break;
        //             case 86:
        //                 bank.scrollPageBackwards();
        //                 break;
        //             case 85:
        //                 bank.scrollPageForwards();
        //                 break;
        //             default:
        //                 break;
        //         }
        //         break;
        //     case 128:
        //         switch (data1) {
        //             case 98:
        //                 this.isShift = false;
        //                 break;
        //         }
        //         break;
        // }
    }
}

const controllers: ApcMini[] = [];

async function init() {
    // const app = host.createApplication();
    for (let i = 0; i < midiPorts; i++) {
        controllers.push(new ApcMini(i));

    }
    println("test initialized!");

}

function flush() {
    controllers.forEach((c) => {
        c.render();
    })
    println("flushed");
}

function exit() {
    controllers.forEach((c) => {
        c.unregister();
    })
    println("exited");
}
