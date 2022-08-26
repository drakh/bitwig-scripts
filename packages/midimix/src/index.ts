import { ControllerControl } from './ControllerControl';

loadAPI(17);

host.setShouldFailOnDeprecatedUse(true);

host.defineController(
    'Drakh',
    'AKAI MIDI Mix',
    '1.0',
    '983297d5-d82d-4afe-af42-fac4add01312',
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
