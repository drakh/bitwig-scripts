import { Constants, Enums, Types } from '@drakh-bitwig/shared';
import PadsBase from './PadsBase';

const emptyEditArray = (): number[] => {
    return new Array<number>(Constants.GRID_SIZE).fill(null);
};

export default class DeviceSelector extends PadsBase {
    private readonly bank: API.TrackBank;
    private padMap: Types.PadCoord = {};
    private deviceLayerPads: Types.DeviceLayerPad[][][];
    private devicesBanks: API.DeviceBank[];
    private deviceLayerBanks: API.DeviceLayerBank[][];
    private deviceChainBanks: API.ChainSelector[][];
    private devicesPads: Types.DevicePad[][];
    private bottomBar: Types.OnOffPad[];
    private pressedBottom: boolean[] = [];
    private editDevice: { [bankPos: number]: number[] } = {
        0: emptyEditArray(),
    };
    private currentBankPosition: number = 0;

    constructor(
        deviceIdx: number,
        midiIn: API.MidiIn,
        midiOut: API.MidiOut,
        bank: API.TrackBank
    ) {
        super(deviceIdx, midiIn, midiOut);
        this.bank = bank;
        bank.scrollPosition().addValueObserver((currentBankPosition) => {
            const { editDevice } = this;
            if (!editDevice[currentBankPosition]) {
                this.editDevice[currentBankPosition] = emptyEditArray();
            }
            this.currentBankPosition = currentBankPosition;
            const currentBottom = this.editDevice[currentBankPosition];
            currentBottom.forEach((item, c) => {
                this.bottomBar[c] = { ...this.bottomBar[c], on: item !== null };
            });
            this.renderBottomRow();
            this.renderPads();
        }, 0);
        const bottomBar: Types.OnOffPad[] = [];
        const devicesPads: Types.DevicePad[][] = [];
        const deviceLayerPads: Types.DeviceLayerPad[][][] = [];

        const devicesBanks: API.DeviceBank[] = [];

        const deviceLayerBanks: API.DeviceLayerBank[][] = [];
        const deviceChainBanks: API.ChainSelector[][] = [];

        const colSize = bank.getSizeOfBank();

        for (let c = 0; c < colSize; c++) {
            devicesPads[c] = [];
            deviceLayerPads[c] = [];
            deviceLayerBanks[c] = [];
            deviceChainBanks[c] = [];
            this.pressedBottom.push(false);

            bottomBar.push({
                pad: 64 + c,
                on: false,
            });

            const track = bank.getItemAt(c);
            const deviceBank = track.createDeviceBank(Constants.GRID_SIZE);
            const maxDevices = deviceBank.getSizeOfBank();
            devicesBanks.push(deviceBank);

            for (let r = 0; r < maxDevices; r++) {
                const pad = 56 + c - r * 8;
                this.padMap[pad] = { c, r };
                const d = r;
                deviceLayerPads[c][r] = [];
                const device = deviceBank.getDevice(r);
                devicesPads[c][r] = {
                    pad,
                    empty: true,
                    active: false,
                    layer: false,
                    c,
                    r,
                };

                device.exists().addValueObserver((value) => {
                    this.setDevicesPadState(
                        {
                            empty: !value,
                        },
                        c,
                        r
                    );
                });

                device.isEnabled().addValueObserver((active) => {
                    this.setDevicesPadState(
                        {
                            active,
                        },
                        c,
                        r
                    );
                });

                device.hasLayers().addValueObserver((layer) => {
                    this.setDevicesPadState(
                        {
                            layer,
                        },
                        c,
                        r
                    );
                });

                const layerBank = device.createLayerBank(Constants.GRID_SIZE);
                for (let l = 0; l < Constants.GRID_SIZE; l++) {
                    const layer = layerBank.getItemAt(l);
                    deviceLayerPads[c][r][l] = {
                        pad: 56 + c - l * 8,
                        chain: false,
                        muted: false,
                        empty: true,
                        c,
                        d,
                        l,
                    };

                    layer.exists().addValueObserver((exists) => {
                        this.setDeviceLayerPadState(
                            {
                                empty: !exists,
                            },
                            c,
                            d,
                            l
                        );
                    });

                    layer.mute().addValueObserver((muted) => {
                        this.setDeviceLayerPadState(
                            {
                                muted,
                            },
                            c,
                            d,
                            l
                        );
                    });
                }

                const chainSeletor = device.createChainSelector();

                chainSeletor.exists().addValueObserver((chain) => {
                    println(JSON.stringify({ chain, c, d }));
                    for (let l = 0; l < Constants.GRID_SIZE; l++) {
                        this.setDeviceLayerPadState(
                            {
                                chain,
                            },
                            c,
                            d,
                            l
                        );
                    }
                });

                chainSeletor.activeChainIndex().addValueObserver((chainIdx) => {
                    for (let l = 0; l < Constants.GRID_SIZE; l++) {
                        this.setDeviceLayerPadState(
                            {
                                muted: chainIdx !== l,
                            },
                            c,
                            d,
                            l
                        );
                    }
                }, Constants.NO_NUMBER);

                deviceLayerBanks[c][d] = layerBank;
                deviceChainBanks[c][d] = chainSeletor;
            }
        }
        this.deviceLayerBanks = deviceLayerBanks;
        this.deviceChainBanks = deviceChainBanks;
        this.devicesPads = devicesPads;
        this.devicesBanks = devicesBanks;
        this.bottomBar = bottomBar;
        this.deviceLayerPads = deviceLayerPads;
    }

    public flush() {
        super.flush();
    }

    public activate() {
        super.activate();
        this.renderPads();
        this.renderBottomRow();
    }

    public deactivate() {
        super.deactivate();
    }

    private setDeviceLayerPadState(
        newState: Partial<Omit<Types.DeviceLayerPad, 'c, d, pad'>>,
        c: number,
        d: number,
        l: number
    ) {
        const { deviceLayerPads } = this;
        const pad = deviceLayerPads[c][d][l];
        this.deviceLayerPads[c][d][l] = this.updateDeviceLayerPad(
            pad,
            newState
        );
    }

    private setDevicesPadState(
        newState: Partial<Omit<Types.DevicePad, 'c, r, pad'>>,
        c: number,
        r: number
    ) {
        const { devicesPads } = this;
        const pad = devicesPads[c][r];
        this.devicesPads[c][r] = this.updateDevicesPad(pad, newState);
    }

    private updateDevicesPad(
        pad: Types.DevicePad,
        newState: Partial<Omit<Types.DevicePad, 'c, r, pad'>>
    ): Types.DevicePad {
        const newPad = {
            ...pad,
            ...newState,
        };
        this.renderDevicePad(newPad);
        return newPad;
    }

    private updateDeviceLayerPad(
        pad: Types.DeviceLayerPad,
        newState: Partial<Omit<Types.DeviceLayerPad, 'c, d, pad'>>
    ): Types.DeviceLayerPad {
        const newPad = {
            ...pad,
            ...newState,
        };
        this.renderDeviceLayerPad(newPad);
        return newPad;
    }

    private renderDeviceLayerPad(item: Types.DeviceLayerPad) {
        const { editDevice, currentBankPosition } = this;
        const { pad, empty, muted, c, d } = item;
        const selectedDevice = editDevice[currentBankPosition][c];
        if (selectedDevice === null || selectedDevice !== d) {
            return;
        }
        if (empty) {
            this.renderPadOff({ pad });
            return;
        }
        if (muted) {
            this.renderPadRed({ pad });
            return;
        }
        this.renderPadGreen({ pad });
    }

    private renderDevicePad(item: Types.DevicePad) {
        const { currentBankPosition } = this;
        const { empty, active, layer, pad, c } = item;

        if (this.editDevice[currentBankPosition][c] !== null) {
            return;
        }

        if (empty) {
            this.renderPadOff({ pad });
            return;
        }
        if (active) {
            layer
                ? this.renderPadGreenBlink({ pad })
                : this.renderPadGreen({ pad });
            return;
        }
        layer
            ? this.renderPadOrangeBlink({ pad })
            : this.renderPadOrange({ pad });
    }

    private renderPads() {
        const { devicesPads, currentBankPosition, editDevice } = this;
        for (let c = 0; c < devicesPads.length; c++) {
            if (editDevice[currentBankPosition][c] === null) {
                this.renderDeviceCol(c);
            } else {
                this.renderLayerCol(c);
            }
        }
    }

    private renderDeviceCol(c: number) {
        const { devicesPads } = this;
        for (let d = 0; d < devicesPads[c].length; d++) {
            const item = devicesPads[c][d];
            this.renderDevicePad(item);
        }
    }

    private renderLayerCol(c: number) {
        const { currentBankPosition, editDevice, deviceLayerPads } = this;
        const d = editDevice[currentBankPosition][c];
        const layerPads = deviceLayerPads[c][d];
        for (let l = 0; l < layerPads.length; l++) {
            this.renderDeviceLayerPad(layerPads[l]);
        }
    }

    public handleMidiIn({ status, data1, data2 }: Types.MidiEvent) {
        super.handleMidiIn({ status, data1, data2 }, 'device');
        const {
            devicesPads,
            padMap,
            currentBankPosition,
            pressedBottom,
            editDevice,
        } = this;

        const col =
            (status === Enums.EVENT_STATUS.NOTE_ON ||
                status === Enums.EVENT_STATUS.NOTE_OFF) &&
            data1 >= 64 &&
            data1 < 64 + Constants.GRID_SIZE
                ? data1 - 64
                : undefined;

        if (col !== undefined && status === Enums.EVENT_STATUS.NOTE_OFF) {
            this.pressedBottom[col] = false;
            return;
        }

        if (col !== undefined && status === Enums.EVENT_STATUS.NOTE_ON) {
            this.pressedBottom[col] = true;
        }

        if (status !== Enums.EVENT_STATUS.NOTE_ON) {
            return;
        }

        const padCoord = padMap[data1];
        const pad = padCoord ? devicesPads[padCoord.c][padCoord.r] : undefined;

        if (pad !== undefined && (this.isShift() || pressedBottom[pad.c])) {
            this.showDeviceLayers(pad);
            return;
        }

        if (
            pad !== undefined &&
            editDevice[currentBankPosition][pad.c] === null
        ) {
            this.toggleDevice(pad);
            return;
        }

        if (
            pad !== undefined &&
            editDevice[currentBankPosition][pad.c] !== null
        ) {
            this.toggleDeviceLayer(
                pad.c,
                editDevice[currentBankPosition][pad.c],
                pad.r
            );
            return;
        }

        if (col !== undefined) {
            this.showDevices(col);
            return;
        }
    }

    private toggleDeviceLayer(c: number, d: number, l: number) {
        const { deviceLayerBanks, deviceChainBanks, deviceLayerPads } = this;
        const currentPad = deviceLayerPads[c][d][l];
        const currentChain = deviceChainBanks[c][d];
        const currentLayerBank = deviceLayerBanks[c][d];
        if (currentPad.chain) {
            currentChain.activeChainIndex().set(l);
            return;
        }
        currentLayerBank.getItemAt(l).mute().toggle();
    }

    private toggleDevice(pad: Types.DevicePad) {
        this.getDevice(pad).isEnabled().toggle();
    }

    private getDevice({ c, r }: Types.DevicePad) {
        const { devicesBanks } = this;
        return devicesBanks[c].getItemAt(r);
    }

    private showDeviceLayers(pad: Types.DevicePad) {
        const { currentBankPosition } = this;
        const { c, r, layer } = pad;
        if (layer) {
            this.editDevice[currentBankPosition][c] = r;
            this.bottomBar[c] = { ...this.bottomBar[c], on: true };
            this.renderBottomRow();
            this.renderLayerCol(c);
        }
    }

    private showDevices(c: number) {
        const { currentBankPosition } = this;
        if (this.editDevice[currentBankPosition][c] === null) {
            return;
        }
        this.editDevice[currentBankPosition][c] = null;
        this.bottomBar[c] = { ...this.bottomBar[c], on: false };
        this.renderDeviceCol(c);
        this.renderBottomRow();
    }

    public setShift(s: boolean) {
        super.setShift(s);
    }

    private renderBottomRow() {
        const { bottomBar } = this;
        bottomBar.forEach((pad) => this.renderOnOffPad(pad));
    }
}
