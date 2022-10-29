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

host.defineMidiPorts(Constants.MIDI_PORTS_DUAL, Constants.MIDI_PORTS_DUAL);

host.addDeviceNameBasedDiscoveryPair(
    Constants.DEVICE_NAMES_DUAL,
    Constants.DEVICE_NAMES_DUAL
);

const controllers: ControllerControl[] = [];

function init() {
    println(String(Constants.GRID_SIZE));
    host.getNotificationSettings().getUserNotificationsEnabled().set(true);
    for (let i = 0; i < Constants.MIDI_PORTS_DUAL; i++) {
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

console.info({ init, flush, exit })
