import { Constants } from '@drakh-bitwig/shared';
import { ControllerControl } from '@drakh-bitwig/apcmini';

loadAPI(17);
host.setShouldFailOnDeprecatedUse(true);

host.defineController(
    'Drakh',
    'AKAI APC MINI dual',
    '0.1',
    '4b35ce8e-2f37-43ef-99bd-b2005f0f04d6',
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
