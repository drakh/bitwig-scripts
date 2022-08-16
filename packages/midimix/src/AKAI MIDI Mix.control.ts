loadAPI(17);

host.setShouldFailOnDeprecatedUse(true);

host.defineController("Drakh", "AKAI MIDI Mix", "0.1", "f8f322d3-d287-49f4-a0e7-0d224eec26d2", "drakh");

const deviceNames = ['MIDI Mix'];

const midiPorts = deviceNames.length;

const gridSize = 8;
const sends = 3;

host.defineMidiPorts(midiPorts, midiPorts);

host.addDeviceNameBasedDiscoveryPair(deviceNames, deviceNames);


interface MidiEvent {
    status: number;
    data1: number;
    data2: number;
}

class MIDIMix {
    private deviceIdx: number;
    private midiIn: API.MidiIn;
    private midiOut: API.MidiOut;
    private bank: API.TrackBank;
    private surface: API.HardwareSurface;
    private sendMidi: MidiEvent[] = [];

    // private input: API.NoteInput;

    constructor(deviceIdx: number) {
        this.deviceIdx = deviceIdx;
        const midiIn = host.getMidiInPort(deviceIdx);
        const midiOut = host.getMidiOutPort(deviceIdx);

        const surface = host.createHardwareSurface();

        const bank = host.createTrackBank(gridSize, sends, 1);
        bank.setShouldShowClipLauncherFeedback(true);
        this.bank = bank;

        this.midiIn = midiIn;
        this.midiOut = midiOut;
        this.surface = surface;

        this.register();
    }

    public flush() {
        println('flush start');
        const {sendMidi, midiOut} = this;
        sendMidi.forEach(({status, data1, data2}) => {
            println(`Send MIDI: ${JSON.stringify({status, data1, data2})}`)
            midiOut.sendMidi(status, data1, data2)
        })
        this.sendMidi = [];
        println('flush end');

    }

    private register() {
        const {midiOut, midiIn, bank, surface} = this;

        for (let c = 0; c < gridSize; c++) {
            try {
                const col = bank.getItemAt(c);

                const soloNote = 1 + c * 3;
                const muteNote = 2 + c * 3;
                const armNote = 3 + c * 3;

                const soloButtonAction = surface.createHardwareButton(`MIDI MIX Btn:${soloNote}`).pressedAction();
                const muteButtonAction = surface.createHardwareButton(`MIDI MIX Btn:${muteNote}`).pressedAction();
                const armButtonAction = surface.createHardwareButton(`MIDI MIX Btn:${armNote}`).pressedAction();

                soloButtonAction.setActionMatcher(midiIn.createNoteOnActionMatcher(0, soloNote));
                muteButtonAction.setActionMatcher(midiIn.createNoteOnActionMatcher(0, muteNote));
                armButtonAction.setActionMatcher(midiIn.createNoteOnActionMatcher(0, armNote));
                col.solo().addBinding(soloButtonAction);
                col.mute().addBinding(muteButtonAction);
                col.arm().addBinding(armButtonAction);

                const volumeSlider = surface.createHardwareSlider(`MIDI MIX Slider:${c}`);
                volumeSlider.setAdjustValueMatcher(midiIn.createAbsoluteCCValueMatcher(0, 19 + (c * 4)));
                col.volume().addBinding(volumeSlider);

                const sends = col.sendBank();
                const sL = sends.getSizeOfBank();
                const max = sL > 3 ? 3 : sL;
                for (let s = 0; s < max; s++) {
                    const send = sends.getItemAt(s);
                    const cc = 16 + s + (c * 4);
                    const sendKnob = surface.createAbsoluteHardwareKnob(`MIDI MIX Knob:${cc}`);
                    sendKnob.setAdjustValueMatcher(midiIn.createAbsoluteCCValueMatcher(0, cc));
                    send.addBinding(sendKnob);
                }

                col.arm().addValueObserver((b) => {
                    this.sendMidi.push({
                        status: 144,
                        data1: armNote,
                        data2: b === true ? 1 : 0
                    });
                });
                col.solo().addValueObserver((b) => {
                    this.sendMidi.push({
                        status: 144,
                        data1: soloNote,
                        data2: b === true ? 1 : 0
                    });
                });
                col.mute().addValueObserver((b) => {
                    this.sendMidi.push({
                        status: 144,
                        data1: muteNote,
                        data2: b === true ? 1 : 0
                    });
                });
            } catch (e) {
                println(JSON.stringify(e));
            }
        }
        const forwardNote = 26;
        const backwardNote = 25;

        const forwardButton = surface.createHardwareButton(`MIDI MIX Btn:${forwardNote}`)
        forwardButton.pressedAction().setActionMatcher(midiIn.createNoteOnActionMatcher(0, forwardNote));
        forwardButton.releasedAction().setActionMatcher(midiIn.createNoteOffActionMatcher(0, forwardNote));
        forwardButton.isPressed().addValueObserver((b) => {
            if (b === true) {
                bank.scrollPageForwards();
            }
        });

        const backwardButton = surface.createHardwareButton(`MIDI MIX Btn:${backwardNote}`)
        backwardButton.pressedAction().setActionMatcher(midiIn.createNoteOnActionMatcher(0, backwardNote));
        backwardButton.releasedAction().setActionMatcher(midiIn.createNoteOffActionMatcher(0, backwardNote));
        backwardButton.isPressed().addValueObserver((b) => {
            if (b === true) {
                bank.scrollPageBackwards();
            }
        });

        bank.canScrollBackwards().addValueObserver((b) => {
            this.sendMidi.push({
                status: 144,
                data1: backwardNote,
                data2: b === true ? 1 : 0
            });
        });

        bank.canScrollForwards().addValueObserver((b) => {
            this.sendMidi.push({
                status: 144,
                data1: forwardNote,
                data2: b === true ? 1 : 0
            });
        });
    }

    // private onMidi(status, data1, data2) {
    //     const {bank} = this;
    //     println(JSON.stringify({status, data1, data2}));
    //     switch (status) {
    //         case 144:
    //             switch (data1) {
    //                 case 25:
    //
    //                     break;
    //                 case 26:
    //                     bank.scrollPageForwards();
    //                     break;
    //                 case 27:
    //                 case 60:
    //                     break;
    //                 default:
    //                     break;
    //             }
    //             break;
    //     }
    // }
}

const controllers: MIDIMix[] = [];

async function init() {
    // const app = host.createApplication();
    for (let i = 0; i < midiPorts; i++) {
        controllers.push(new MIDIMix(i));

    }
    println("test initialized!");

}

function flush() {
    controllers.forEach((c) => {
        c.flush();
    });
    println("flushed");
}

function exit() {
    // controllers.forEach((c) => {
    //     c.unregister();
    // })
    println("exited");
}
