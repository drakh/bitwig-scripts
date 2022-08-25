import { PadsBase } from './PadsBase';
import { GRID_SIZE } from '../constants';
import { EVENT_STATUS } from '../enums';
import { LauncherPad, OnOffPad, MidiEvent } from '../types';

export class ClipLauncher extends PadsBase {
    private readonly bank: API.TrackBank;
    private launcherPads: LauncherPad[];
    private bottomBar: {
        trackPlayingPads: OnOffPad[];
        trackGroupPads: OnOffPad[];
    };

    constructor(
        deviceIdx: number,
        midiIn: API.MidiIn,
        midiOut: API.MidiOut,
        bank: API.TrackBank
    ) {
        super(deviceIdx, midiIn, midiOut);
        this.bank = bank;

        const launcherPads: LauncherPad[] = [];
        const trackPlayingPads: OnOffPad[] = [];
        const trackGroupPads: OnOffPad[] = [];

        const colSize = bank.getSizeOfBank();

        for (let c = 0; c < colSize; c++) {
            const bottomPad: OnOffPad = {
                pad: 64 + c,
                on: false,
            };
            trackPlayingPads.push(bottomPad);
            trackGroupPads.push(bottomPad);

            const col = bank.getItemAt(c);
            const rows = col.clipLauncherSlotBank();
            const rowsSize = rows.getSizeOfBank();
            for (let r = 0; r < rowsSize; r++) {
                launcherPads.push({
                    pad: 56 + c - r * 8,
                    toPlay: false,
                    playing: false,
                    empty: true,
                    isGroup: false,
                    c,
                    r,
                });

                const cell = rows.getItemAt(r);
                cell.hasContent().addValueObserver((hasContent) => {
                    this.setLauncherPadState(
                        {
                            empty: !hasContent,
                        },
                        c,
                        r
                    );
                });
                cell.isPlaying().addValueObserver((playing) => {
                    this.setLauncherPadState(
                        {
                            playing,
                        },
                        c,
                        r
                    );
                });
                cell.isPlaybackQueued().addValueObserver((toPlay) => {
                    this.setLauncherPadState(
                        {
                            toPlay,
                        },
                        c,
                        r
                    );
                });
            }
            col.isGroup().addValueObserver((isGroup) => {
                this.updateBottomBarState(c, isGroup, 'group');
                this.setLauncherColState({ isGroup }, c);
            });
            col.isGroupExpanded().markInterested();
            col.isStopped().addValueObserver((off) => {
                this.updateBottomBarState(c, !off, 'playing');
            });
        }

        this.launcherPads = launcherPads;
        this.bottomBar = {
            trackPlayingPads,
            trackGroupPads,
        };
    }

    public flush() {
        super.flush();
    }

    public handleMidiIn({ status, data1, data2 }: MidiEvent) {
        super.handleMidiIn({ status, data1, data2 }, 'launcher');
        const { launcherPads } = this;
        if (status !== EVENT_STATUS.NOTE_ON) {
            return;
        }

        const pad = launcherPads.find(({ pad }) => pad === data1);
        const col =
            data1 >= 64 && data1 < 64 + GRID_SIZE ? data1 - 64 : undefined;

        if (this.isShift()) {
            pad ? this.toggleExpand(pad.c) : null;
            col !== undefined ? this.toggleExpand(col) : null;
            return;
        }
        pad ? this.launchClip(pad.c, pad.r) : null;
        col !== undefined ? this.stopTrack(col) : null;
    }

    public activate() {
        super.activate();
        this.renderLauncherPads();
        this.renderBottomRow();
    }

    public deactivate() {
        super.deactivate();
    }

    public setShift(s: boolean) {
        super.setShift(s);
        this.renderBottomRow();
    }

    private setLauncherColState(
        newState: Partial<Omit<LauncherPad, 'c, r, pad'>>,
        c: number
    ) {
        const { launcherPads } = this;
        this.launcherPads = launcherPads.map((pad) => {
            if (pad.c === c) {
                return this.updateLauncherPad(pad, newState);
            }
            return pad;
        });
    }

    private updateBottomBarState(
        idx: number,
        on: boolean,
        w: 'group' | 'playing'
    ) {
        const {
            bottomBar: { trackPlayingPads, trackGroupPads },
        } = this;
        const selected = w === 'group' ? trackGroupPads : trackPlayingPads;
        const updated: OnOffPad[] = selected.map((item, i) => {
            if (i === idx) {
                const newIten = {
                    ...item,
                    on,
                };
                this.renderOnOffPad(newIten);
                return newIten;
            }
            return item;
        });
        this.bottomBar = {
            trackPlayingPads: w === 'playing' ? updated : trackPlayingPads,
            trackGroupPads: w === 'group' ? updated : trackGroupPads,
        };
    }

    private updateLauncherPad(
        pad: LauncherPad,
        newState: Partial<Omit<LauncherPad, 'c, r, pad'>>
    ): LauncherPad {
        const newPad = {
            ...pad,
            ...newState,
        };
        this.renderLauncherPad(newPad);
        return newPad;
    }

    private setLauncherPadState(
        newState: Partial<Omit<LauncherPad, 'c, r, pad'>>,
        c: number,
        r: number
    ) {
        const { launcherPads } = this;
        this.launcherPads = launcherPads.map((pad) => {
            if (pad.c === c && pad.r === r) {
                return this.updateLauncherPad(pad, newState);
            }
            return pad;
        });
    }

    private renderLauncherPad(item: LauncherPad) {
        const { empty, playing, isGroup, toPlay, pad } = item;

        if (empty) {
            isGroup
                ? this.renderPadOrangeBlink({ pad })
                : this.renderPadOff({ pad });
            return;
        }
        if (toPlay) {
            this.renderPadGreenBlink({ pad });
            return;
        }
        if (playing) {
            isGroup
                ? this.renderPadRedBlink({ pad })
                : this.renderPadGreen({ pad });
            return;
        }

        isGroup ? this.renderPadRed({ pad }) : this.renderPadOrange({ pad });
    }

    private renderLauncherPads() {
        const { launcherPads } = this;
        launcherPads.forEach((item) => {
            this.renderLauncherPad(item);
        });
    }

    private renderBottomRow() {
        const {
            bottomBar: { trackPlayingPads, trackGroupPads },
        } = this;
        const padsToRender = this.isShift() ? trackGroupPads : trackPlayingPads;
        padsToRender.forEach((pad) => this.renderOnOffPad(pad));
    }

    private launchClip(c: number, r: number) {
        const { bank } = this;
        bank.getItemAt(c).clipLauncherSlotBank().getItemAt(r).launch();
    }

    private stopTrack(c) {
        const { bank } = this;
        bank.getItemAt(c).stop();
    }

    private toggleExpand(c: number) {
        const { bank } = this;
        const expanded = bank.getItemAt(c).isGroupExpanded().get();
        bank.getItemAt(c).isGroupExpanded().set(!expanded);
    }
}
