const Gpio = require('onoff').Gpio; // Import the onoff library

const config = {
  "solenoidPin":15,
  "startBeamPins":[2,3,4],
  "finishBeamPins":[17,27,22]
}

var tracks = [];

class Track {
  constructor(trackNum, startPin, finishPin, onFinish) {
    this.isRunning = false;
    this.id = trackNum;
    this.startPin = startPin;
    this.finishPin = finishPin;

    this.startCtl = new Gpio(this.startPin, 'in', 'rising');
    this.finishCtl = new Gpio(this.finishPin, 'in', 'rising');

    this.startCtl.watch((err, value) => {
      if (err) {
        throw err;
      }
      if (this.startTime === ""){ //don't overwrite
        this.startTime = Date.now();
        this.isRunning = true;
      }
    });

    this.finishCtl.watch((err, value) => {
      if (err) {
        throw err;
      }
      if (this.finishTime === ""){ //don't overwrite
        this.finishTime = Date.now();
        this.isRunning = false;
        //TODO display 1st 2nd 3rd...
        document.getElementById("lane"+ this.id +"Time").innerHTML = this.finishTime - this.startTime + " ms";
      }
    });
  }
}

//initialize output pin for solenoid car release
solenoid = new Gpio(config.solenoidPin, 'out');

//initialize all tracks per config json
for (let i = 0; i < config.startBeamPins.length; i++) {  // create tracks for each startBeamPins.
  tracks[i] = new Track(i, config.startBeamPins[i], config.finishBeamPins[i]);
}

//Start Race when spacebar is pressed.
document.onkeyup = function(e){

  // check if any track isRunning.
  for (let i = 0; i < tracks.length; i++) {
    if (!tracks[i].isRunning) return false; //if any track is still running do not start new race.
  }

  if(e.keyCode == 32){   // function run if spacebar is pressed.
    resetTrack();
    solenoid.writeSync(1); //set pin state to 1(power solenoid)
    setTimeout(offSolenoid, 1000); //release solenoid after 1 seconds
    setTimeout(resetTrack, 5000); //timeout if race isn't completed after 5 sec.
  }
}

function resetTrack(){
  for (let i = 0; i < config.startBeamPins.length; i++) {  // clear race data
    tracks[i].startTime = "";
    tracks[i].finishTime = "";
    tracks[i].isRunning = false;
    document.getElementById("lane"+ trackNum +"Time").innerHTML = "-.--- ms";
    //TODO clear 1st 2nd 3rd
  }
};

function offSolenoid() { //call back function to power off solenoid
  solenoid.writeSync(0); // Turn solenoid relay off
}

process.on('SIGINT', function () { // Listen to the event triggered on CTRL+C
  Solenoid.writeSync(0); //  Cleanly close the GPIO pin before exiting
  solenoid.unexport();
  process.exit();
});
