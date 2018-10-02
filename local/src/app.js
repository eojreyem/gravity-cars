var onoff = require('onoff'); //#A

var Gpio = onoff.Gpio,

  solenoid = new Gpio(15, 'out'); //output triggering relay for solenoid releasing cars.
  beam0 = new Gpio(14, 'in', 'falling'); //Initialize beam breaks
  beam1 = new Gpio(2, 'in', 'falling');
  beam2 = new Gpio(3, 'in', 'falling');
  beam3 = new Gpio(4, 'in', 'falling');

var raceTimes = [];
var timeIndex = 0;

function startRace(){
  var timeNow = (new Date()).getTime();
  console.log("Solenoid release Time: " + timeNow);
  var timeNow = (new Date()).getTime();
  solenoid.writeSync(1); //set pin state to 1(power solenoid)
  setTimeout(offSolenoid, 1000); //release solenoid after 3 seconds
  var raceName = document.getElementById("tbRaceName").value;
  console.log("Run name: " + raceName);
};

function offSolenoid() { //function to power off solenoid
  solenoid.writeSync(0); // Turn solenoid relay off
}

beam0.watch((err, value) => {
  if (err) {
    throw err;
  }
  //var timeNow = (new Date()).getTime();
  raceTimes[timeIndex] = (new Date()).getTime();
  timeIndex++;
  //console.log("Beam 0 Time: " + timeNow);
});

beam1.watch((err, value) => {
  if (err) {
    throw err;
  }
  //var timeNow = (new Date()).getTime();
  raceTimes[timeIndex] = (new Date()).getTime();
  timeIndex++;

  //console.log("Beam 1 Time: " + timeNow);
});
beam2.watch((err, value) => {
  if (err) {
    throw err;
  }
  //var timeNow = (new Date()).getTime();
  raceTimes[timeIndex] = (new Date()).getTime();
  timeIndex++;
  //console.log("Beam 2 Time: " + timeNow);
});
beam3.watch((err, value) => {
  if (err) {
    throw err;
  }
  //var timeNow = (new Date()).getTime();
  //console.log("Beam 3 Time: " + timeNow);
  raceTimes[timeIndex] = (new Date()).getTime();
  if (timeIndex>=5){
    endRace();
  }
  timeIndex++;
});

function endRace(){
  console.log(raceTimes);
  var i;
  for (i = 0; i < raceTimes.length; i++) {
    time = raceTimes[i]-raceTimes[0]
      console.log(time);
  }

}


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
