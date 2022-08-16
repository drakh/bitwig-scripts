loadAPI(17);

host.setShouldFailOnDeprecatedUse(true);

host.defineController("Drakh", "AKAI MIDI Mix", "1.0", "f8f322d3-d287-49f4-a0e7-0d224eec26d2", "drakh");

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
    private readonly deviceIdx: number;
    private readonly midiIn: API.MidiIn;
    private readonly midiOut: API.MidiOut;
    private readonly bank: API.TrackBank;
    private readonly surface: API.HardwareSurface;
    private sendMidi: MidiEvent[] = [];

    constructor(deviceIdx: number) {
        const midiIn = host.getMidiInPort(deviceIdx);
        const midiOut = host.getMidiOutPort(deviceIdx);

        const surface = host.createHardwareSurface();

        const bank = host.createTrackBank(gridSize, sends, 1);
        bank.setShouldShowClipLauncherFeedback(true);

        this.deviceIdx = deviceIdx;
        this.midiIn = midiIn;
        this.midiOut = midiOut;
        this.bank = bank;
        this.surface = surface;

        this.register();
    }

    public flush() {
        const {sendMidi, midiOut} = this;
        sendMidi.forEach(({status, data1, data2}) => {
            midiOut.sendMidi(status, data1, data2)
        })
        this.sendMidi = [];
    }

    private register() {
        const {midiIn, bank, surface} = this;

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
}

const controllers: MIDIMix[] = [];

function init() {
    for (let i = 0; i < midiPorts; i++) {
        controllers.push(new MIDIMix(i));
    }

}

function flush() {
    controllers.forEach((c) => {
        c.flush();
    });
}

function exit() {
    println("exited");
}
