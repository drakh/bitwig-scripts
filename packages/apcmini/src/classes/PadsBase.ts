import { MidiEvent } from '../types';
import { BUTTON_COLOR, EVENT_STATUS } from '../enums';
import { GRID_SIZE } from '../constants';
import { Pad, OnOffPad } from '../types';

export class PadsBase {
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
        this.clearBottomBar();
        this.clearSideBar();
    }

    protected deactivate() {
        this.active = false;
        this.midiEvents = [];
    }

    protected renderPad(pad: number, color: BUTTON_COLOR) {
        this.addEvent({
            status: EVENT_STATUS.NOTE_ON,
            data1: pad,
            data2: color,
        });
    }

    protected renderOnOffPad({ pad, on }: OnOffPad) {
        on ? this.renderPadOn({ pad }) : this.renderPadOff({ pad });
    }

    protected renderPadOff({ pad }: Pad) {
        this.renderPad(pad, BUTTON_COLOR.OFF);
    }

    protected renderPadOn({ pad }: Pad) {
        this.renderPad(pad, BUTTON_COLOR.GREEN);
    }

    protected renderPadGreen({ pad }: Pad) {
        this.renderPad(pad, BUTTON_COLOR.GREEN);
    }

    protected renderPadGreenBlink({ pad }: Pad) {
        this.renderPad(pad, BUTTON_COLOR.GREEN_BLINK);
    }

    protected renderPadRed({ pad }: Pad) {
        this.renderPad(pad, BUTTON_COLOR.RED);
    }

    protected renderPadRedBlink({ pad }: Pad) {
        this.renderPad(pad, BUTTON_COLOR.RED_BLINK);
    }

    protected renderPadOrange({ pad }: Pad) {
        this.renderPad(pad, BUTTON_COLOR.ORANGE);
    }

    protected renderPadOrangeBlink({ pad }: Pad) {
        this.renderPad(pad, BUTTON_COLOR.ORANGE_BLINK);
    }

    protected handleMidiIn({ status, data1, data2 }: MidiEvent, text = '') {
        println(`${text}:${JSON.stringify({ status, data1, data2 })}`);
    }

    protected addEvent(midiEvent: MidiEvent) {
        const { active } = this;
        if (active) {
            this.midiEvents.push(midiEvent);
        }
    }

    protected clearPads() {
        this.clear(0, 64);
    }

    protected clearBottomBar() {
        this.clear(64, 64 + GRID_SIZE);
    }

    protected clearSideBar() {
        this.clear(82, 82 + GRID_SIZE);
    }

    private clear(min: number, max: number) {
        for (let pad = min; pad < max; pad++) {
            this.renderPadOff({ pad });
        }
    }
}
