import { Constants, Enums, Types } from '@drakh-bitwig/shared';

export default class PadsBase {
    protected readonly deviceIdx: number;
    protected readonly midiIn: API.MidiIn;
    protected readonly midiOut: API.MidiOut;

    private shift: boolean = false;
    private active: boolean = false;
    private midiEvents: Types.MidiEvent[] = [];

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
        this.clearBottomBar();
        this.clearSideBar();
    }

    protected deactivate() {
        this.active = false;
        this.midiEvents = [];
    }

    protected renderPad(pad: number, color: Enums.BUTTON_COLOR) {
        this.addEvent({
            status: Enums.EVENT_STATUS.NOTE_ON,
            data1: pad,
            data2: color,
        });
    }

    protected renderOnOffPad({ pad, on }: Types.OnOffPad) {
        on ? this.renderPadOn({ pad }) : this.renderPadOff({ pad });
    }

    protected renderPadOff({ pad }: Types.Pad) {
        this.renderPad(pad, Enums.BUTTON_COLOR.OFF);
    }

    protected renderPadOn({ pad }: Types.Pad) {
        this.renderPad(pad, Enums.BUTTON_COLOR.GREEN);
    }

    protected renderPadGreen({ pad }: Types.Pad) {
        this.renderPad(pad, Enums.BUTTON_COLOR.GREEN);
    }

    protected renderPadGreenBlink({ pad }: Types.Pad) {
        this.renderPad(pad, Enums.BUTTON_COLOR.GREEN_BLINK);
    }

    protected renderPadRed({ pad }: Types.Pad) {
        this.renderPad(pad, Enums.BUTTON_COLOR.RED);
    }

    protected renderPadRedBlink({ pad }: Types.Pad) {
        this.renderPad(pad, Enums.BUTTON_COLOR.RED_BLINK);
    }

    protected renderPadOrange({ pad }: Types.Pad) {
        this.renderPad(pad, Enums.BUTTON_COLOR.ORANGE);
    }

    protected renderPadOrangeBlink({ pad }: Types.Pad) {
        this.renderPad(pad, Enums.BUTTON_COLOR.ORANGE_BLINK);
    }

    protected handleMidiIn(
        { status, data1, data2 }: Types.MidiEvent,
        text = ''
    ) {
        println(`${text}:${JSON.stringify({ status, data1, data2 })}`);
    }

    protected addEvent(midiEvent: Types.MidiEvent) {
        const { active } = this;
        if (active) {
            this.midiEvents.push(midiEvent);
        }
    }

    protected clearPads() {
        this.clear(0, 64);
    }

    protected clearBottomBar() {
        this.clear(64, 64 + Constants.GRID_SIZE);
    }

    protected clearSideBar() {
        this.clear(82, 82 + Constants.GRID_SIZE);
    }

    private clear(min: number, max: number) {
        for (let pad = min; pad < max; pad++) {
            this.renderPadOff({ pad });
        }
    }
}
