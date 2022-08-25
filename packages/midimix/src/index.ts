import { ControllerControl } from './ControllerControl';

loadAPI(17);

host.setShouldFailOnDeprecatedUse(true);

host.defineController(
    'Drakh',
    'AKAI MIDI Mix',
    '1.0',
    'f8f322d3-d287-49f4-a0e7-0d224eec26d2',
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
