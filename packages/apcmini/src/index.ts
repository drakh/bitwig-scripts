import { MIDI_PORTS, DEVICE_NAMES } from './constants';
import { ControllerControl } from './classes/ControllerControl';

loadAPI(17);
host.setShouldFailOnDeprecatedUse(true);

host.defineController(
    'Drakh',
    'AKAI APC mini',
    '0.1',
    '165cb4eb-3c8f-46e4-b283-4a93401cd0f2',
    'drakh'
);

host.defineMidiPorts(MIDI_PORTS, MIDI_PORTS);

host.addDeviceNameBasedDiscoveryPair(DEVICE_NAMES, DEVICE_NAMES);

const controllers: ControllerControl[] = [];

async function init() {
    host.getNotificationSettings().getUserNotificationsEnabled().set(true);
    for (let i = 0; i < MIDI_PORTS; i++) {
        controllers.push(new ControllerControl(i));
    }
}

function flush() {
    controllers.forEach((c) => {
        c.flush();
    });
    println('flushed');
}

function exit() {
    println('exited');
}
