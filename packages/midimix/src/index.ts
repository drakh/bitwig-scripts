import { ControllerControl } from './ControllerControl';
import {midiPorts, deviceNames} from './constants';

loadAPI(17);

host.setShouldFailOnDeprecatedUse(true);

host.defineController(
    'Drakh',
    'AKAI MIDI Mix',
    '0.1',
    '7233422f-39d7-4d05-b3a9-c36d86b44272',
    'drakh'
);

host.defineMidiPorts(midiPorts, midiPorts);

host.addDeviceNameBasedDiscoveryPair(deviceNames, deviceNames);

const controllers: ControllerControl[] = [];

function init() {
    for (let i = 0; i < midiPorts; i++) {
        controllers.push(new ControllerControl(i));
    }
}

function flush() {
    controllers.forEach((c) => {
        c.flush();
    });
}

function exit() {
    println('exited');
}

console.info({ init, flush, exit });
