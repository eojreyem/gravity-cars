var onoff = require('onoff'); //#A

var Gpio = onoff.Gpio,

  startSwitch = new Gpio(15,)
  beamStart = new Gpio(14, 'in', 'falling');
  beam1 = new Gpio(2, 'in', 'falling');
  beam2 = new Gpio(3, 'in', 'falling');
  beam3 = new Gpio(4, 'in', 'falling');

function startRace(){
  console.log("GO GO GO!");
};

//  interval;

// interval = setInterval(function () { //#C
//   var value = (led.readSync() + 1) % 2; //#D
//   led.write(value, function() { //#E
//     console.log("Changed LED state to: " + value);
//   });
// }, 2000);


beamStart.watch((err, value) => {
  if (err) {
    throw err;
  }
  var timeNow = (new Date()).getTime();
  console.log("Beam Start Time: " + timeNow);
});

beam1.watch((err, value) => {
  if (err) {
    throw err;
  }
  var timeNow = (new Date()).getTime();
  console.log("Beam 1 Time: " + timeNow);
});
beam2.watch((err, value) => {
  if (err) {
    throw err;
  }
  var timeNow = (new Date()).getTime();
  console.log("Beam 2 Time: " + timeNow);
});
beam3.watch((err, value) => {
  if (err) {
    throw err;
  }
  var timeNow = (new Date()).getTime();
  console.log("Beam 3 Time: " + timeNow);
  document.getElementById("raceTime").innerHTML = timeNow;
});




process.on('SIGINT', function () { //#F
  clearInterval(interval);
  led.writeSync(0); //#G
  led.unexport();
  console.log('Bye, bye!');
  process.exit();
});

// #A Import the onoff library
// #B Initialize pin 4 to be an output pin
// #C This interval will be called every 2 seconds
// #D Synchronously read the value of pin 4 and transform 1 to 0 or 0 to 1
// #E Asynchronously write the new value to pin 4
// #F Listen to the event triggered on CTRL+C
// #G Cleanly close the GPIO pin before exiting
