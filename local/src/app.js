var onoff = require('onoff'); //#A

var Gpio = onoff.Gpio,

  solenoid = new Gpio(15, 'out'); //output triggering relay for solenoid releasing cars.
  beam0 = new Gpio(14, 'in', 'falling'); //Initialize beam breaks
  beam1 = new Gpio(2, 'in', 'falling');
  beam2 = new Gpio(3, 'in', 'falling');
  beam3 = new Gpio(4, 'in', 'falling');

var replicate = 1;
var raceName = "blank";
var raceTimes = [];

function startRace(){
  raceTimes = [];
  var timeNow = (new Date()).getTime();
  raceTimes[0] = timeNow;
  //console.log("Solenoid release Time: " + timeNow);
  var timeNow = (new Date()).getTime();
  solenoid.writeSync(1); //set pin state to 1(power solenoid)
  setTimeout(offSolenoid, 1000); //release solenoid after 3 seconds
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
  console.log("beam0" + value);
  if (err) {
    throw err;
  }
  if (raceTimes[1]){
    raceTimes[2] = (new Date()).getTime();
  } else {
    raceTimes[1] = (new Date()).getTime();
  }
});

beam1.watch((err, value) => {
  console.log("beam1" + value);
  if (err) {
    throw err;
  }
  if (raceTimes[3]){
    raceTimes[4] = (new Date()).getTime();
  } else {
    raceTimes[3] = (new Date()).getTime();
  }
});
beam2.watch((err, value) => {
  console.log("beam2" + value);
  if (err) {
    throw err;
  }
  if (raceTimes[5]){
    raceTimes[6] = (new Date()).getTime();
  } else {
    raceTimes[5] = (new Date()).getTime();
  }
});
beam3.watch((err, value) => {
  console.log("beam3" + value);
  if (err) {
    throw err;
  }
  if (raceTimes[7]>1){
    raceTimes[8] = (new Date()).getTime();
    endRace();
  } else {
    raceTimes[7] = (new Date()).getTime();
  }

});

function endRace(){
  console.log(Date.now());
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

process.on('SIGINT', function () { //#F
  clearInterval(interval);
  Solenoid.writeSync(0); //#G
  solenoid.unexport();
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
