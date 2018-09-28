const Gpio = require('onoff').Gpio;
const led = new Gpio(11, 'out');
const button = new Gpio(13, 'in', 'both');

button.watch((err, value) => led.writeSync(value));
