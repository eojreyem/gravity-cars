const Gpio = require('onoff').Gpio; // Import the onoff library

const config = {
  "solenoidPin":3,
  "startBeamPins":[16,20,21],
  "finishBeamPins":[25,8,7]
}

var tracks = [];
var finishPlace = 1;
var isRacing = false;

class Track {
  constructor(startPin, finishPin, onFinish) {
    this.isRunning = false;
    this.startPin = startPin;
    this.finishPin = finishPin;

    this.startCtl = new Gpio(this.startPin, 'in', 'both');
    this.finishCtl = new Gpio(this.finishPin, 'in', 'rising');

    this.startCtl.watch((err, value) => {
      if (err) {
        throw err;
      }
      console.log("start " + tracks.findIndex(track => track == this) + "beam = " + value);
      if (value == true){
        document.getElementById("award"+ tracks.findIndex(track => track == this)).src = "src/images/car.png";
      }else{
        document.getElementById("award"+ tracks.findIndex(track => track == this)).src = "";
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
      console.log("finish " + tracks.findIndex(track => track == this) + "beam = " + value);
      if (this.finishTime === ""){ //don't overwrite
        this.finishTime = Date.now();
        this.isRunning = false;

        //TODO display 1st 2nd 3rd...
        document.getElementById("award"+ tracks.findIndex(track => track == this)).src = "src/images/"+finishPlace+ "award.png";
        finishPlace++;
        var time = (this.finishTime - this.startTime)/1000;
        var time3dec = time.toFixed(3);

        document.getElementById("lane"+ tracks.findIndex(track => track == this) +"Time").innerHTML = time3dec + " s";
      }
    });
  }
}

//initialize output pin for solenoid car release
solenoid = new Gpio(config.solenoidPin, 'out');

//initialize all tracks per config json
for (let i = 0; i < config.startBeamPins.length; i++) {  // create tracks for each startBeamPins.
  tracks[i] = new Track(config.startBeamPins[i], config.finishBeamPins[i]);
  console.log("track " +i+ " configured");
}

//Start Race when spacebar is pressed.
document.onkeyup = function(e){
  console.log(e.keyCode+ " = keycode pressed");
  // check if any track isRunning.
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].isRunning) return false; //if any track is still running do not start new race.
  }

  if(e.keyCode == 32){   // function run if spacebar is pressed.
    console.log("Spacebar = START!!!");
    resetTrack();
    finishPlace = 1;
    document.getElementById("lane0Time").innerHTML = "-.--- ms";
    document.getElementById("lane1Time").innerHTML = "-.--- ms";
    document.getElementById("lane2Time").innerHTML = "-.--- ms";
    document.getElementById("award0").src = "src/images/car.png";
    document.getElementById("award1").src = "src/images/car.png";
    document.getElementById("award2").src = "src/images/car.png";
    solenoid.writeSync(1); //set pin state to 1(power solenoid)
    setTimeout(offSolenoid, 1000); //release solenoid after 1 seconds
    setTimeout(resetTrack, 5000); //timeout if race isn't completed after 5 sec.
  }
}

function resetTrack(){
  for (let i = 0; i < config.startBeamPins.length; i++) {  // clear race data
    console.log("reset track "+i);
    tracks[i].startTime = "";
    tracks[i].finishTime = "";
    tracks[i].isRunning = false;
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
