var onoff = require('onoff'); // Import the onoff library

var Gpio = onoff.Gpio,

solenoid = new Gpio(15, 'out'); //output triggering relay for solenoid releasing cars.
beam = [new Gpio(2, 'in', 'falling'), new Gpio(3, 'in', 'falling'), new Gpio(4, 'in', 'falling')]
beam0 = new Gpio(14, 'in', 'falling'); //Initialize beam breaks

var replicate = 1;
var raceName = "blank";
var raceTimes = [];

function startRace(){
  raceTimes = [];
  var timeNow = (new Date()).getTime();
  raceTimes[0] = timeNow;
  solenoid.writeSync(1); //set pin state to 1(power solenoid)
  setTimeout(offSolenoid, 1000); //release solenoid after 1 second
  var currentRaceName = document.getElementById("tbRaceName").value;
  if (currentRaceName != raceName){
    replicate = 1;
    raceName = currentRaceName;
    console.log("Run name: " + raceName);
  }
};

function offSolenoid() { //function to power off solenoid
  solenoid.writeSync(0); // Turn solenoid relay off
}

beam0.watch((err, value) => {
  if (err) {
    throw err;
  }
  if (raceTimes[1]){
    raceTimes[2] = (new Date()).getTime();
  } else {
    raceTimes[1] = (new Date()).getTime();
  }
});

beam.watch((err, value) => {
  console.log(value);
  if (err) {
    throw err;
  }
  if (raceTimes[3]){
    raceTimes[4] = (new Date()).getTime();
  } else {
    raceTimes[3] = (new Date()).getTime();
  }
});

function endRace(){
  var i;
  for (i = 1; i < raceTimes.length; i++) {
    raceTimes[i] = raceTimes[i]-raceTimes[0];
  }
  raceTimes[0] = 0;
  document.getElementById("lane1Time").innerHTML = raceTimes[6]+" ms";
  document.getElementById("lane2Time").innerHTML = raceTimes[7]+" ms";
  document.getElementById("lane3Time").innerHTML = raceTimes[8]+" ms";

  console.log("Rep"+replicate+" Times: " +raceTimes[0]+", "+raceTimes[1]+", "+raceTimes[2]+", "+raceTimes[3]+", "+raceTimes[4]+", "+raceTimes[5]+", "+raceTimes[6]+", "+raceTimes[7]+", "+raceTimes[8]);
  replicate++;
  raceTimes.length = 0;
}

process.on('SIGINT', function () { //Listen to the event triggered on CTRL+C
  clearInterval(interval);
  Solenoid.writeSync(0); //Cleanly close the GPIO pin before exiting
  solenoid.unexport();
  console.log('Bye, bye!');
  process.exit();
});
