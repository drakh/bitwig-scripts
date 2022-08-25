import { Constants, ControllerControl } from '@drakh-bitwig/apcmini';

loadAPI(17);
host.setShouldFailOnDeprecatedUse(true);

host.defineController(
    'Drakh',
    'AKAI APC MINI single',
    '0.1',
    '165cb4eb-3c8f-46e4-b283-4a93401cd0f2',
    'drakh'
);

host.defineMidiPorts(Constants.MIDI_PORTS, Constants.MIDI_PORTS);

host.addDeviceNameBasedDiscoveryPair(
    Constants.DEVICE_NAMES,
    Constants.DEVICE_NAMES
);

const controllers: ControllerControl[] = [];

async function init() {
    println(String(Constants.GRID_SIZE));
    host.getNotificationSettings().getUserNotificationsEnabled().set(true);
    for (let i = 0; i < Constants.MIDI_PORTS; i++) {
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
