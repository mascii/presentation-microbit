(async () => {
    const DEVICE_NAME_PREFIX = 'BBC micro:bit';
    const BUTTON_SERVICE_UUID = 'e95d9882-251d-470a-a062-fa1922dfa9a8';
    const BUTTON_A_DATA_UUID = 'e95dda90-251d-470a-a062-fa1922dfa9a8';
    const BUTTON_B_DATA_UUID = 'e95dda91-251d-470a-a062-fa1922dfa9a8';
    const [LEFT_ARROW_KEY_CODE, RIGHT_ARROW_KEY_CODE] = [37, 39];

    const pressKey = keyCode => {
        const activeElement = document.activeElement;
        const targetDocument = activeElement.tagName === 'IFRAME' ? activeElement.contentDocument : document;
        ['keydown', 'keyup'].forEach(typeArg => {
            targetDocument.body.dispatchEvent(new KeyboardEvent(typeArg, { keyCode, bubbles: true }));
        });
    };

    const startService = async (service, charUUID) => {
        const characteristic = await service.getCharacteristic(charUUID);
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged',
            event => {
                if (event.target.value.getUint8(0, true) !== 1) {
                    return;
                }
                if (charUUID === BUTTON_A_DATA_UUID) {
                    pressKey(LEFT_ARROW_KEY_CODE);
                } else if (charUUID === BUTTON_B_DATA_UUID) {
                    pressKey(RIGHT_ARROW_KEY_CODE);
                }
            });
    };

    const device = await navigator.bluetooth.requestDevice({
        filters: [{
            namePrefix: DEVICE_NAME_PREFIX,
        }],
        optionalServices: [BUTTON_SERVICE_UUID],
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(BUTTON_SERVICE_UUID);
    startService(service, BUTTON_A_DATA_UUID);
    startService(service, BUTTON_B_DATA_UUID);

    if (navigator.wakeLock) {
        const requestWakeLock = (isFirstRequest) => {
            if (document.visibilityState !== 'visible') {
                return;
            }
            navigator.wakeLock.request('screen').then(() => {
                if (isFirstRequest) {
                    document.addEventListener('visibilitychange', requestWakeLock);
                    document.addEventListener('fullscreenchange', requestWakeLock);
                }
            }).catch(() => {});
        };
        requestWakeLock(true);
    }
})();
