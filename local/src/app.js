const Gpio = require('onoff').Gpio; // Import the onoff library

const config = {
  "solenoidPin":3,
  "startBeamPins":[16,20,21],
  "finishBeamPins":[25,8,7]
}

var tracks = [];
var finishPlace = 1;
var startTime = "";

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
      if (startTime === ""){
        if (value == 1){
          document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/empty_track.png";
        }else{
          document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/track_with_car.png";
        }
      }
      // if (isRacing == true && value == 0){
      //   if (this.startTime === ""){ //don't overwrite
      //     this.startTime = Date.now();
      //     this.isRunning = true;
      //     console.log("Lane "+ tracks.findIndex(track => track == this)+" start time: " +this.startTime);
      //   }
      // }
    });

    this.finishCtl.watch((err, value) => {
      if (err) {
        throw err;
      }
      console.log("finish " + tracks.findIndex(track => track == this) + "beam = " + value);
      if (this.finishTime === ""){ //don't overwrite
        this.finishTime = Date.now();
        this.isRunning = false;
        document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/track_with_award"+finishPlace+ ".png";
        finishPlace++;
        var time = (this.finishTime - startTime)/1000;
        var time3dec = time.toFixed(3);
        document.getElementById("lane"+ tracks.findIndex(track => track == this) +"Time").innerHTML = time3dec + " s";
        // for (let i = 0; i < tracks.length; i++) {
        //   if (tracks[i].isRunning) return false; //if any track is still running do not start new race.
        // }
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
  // TODO check if any track isRunning.


  if(e.keyCode == 32){   // function run if spacebar is pressed.
    console.log("Spacebar = START!!!");
    resetTrack();
    finishPlace = 1;
    solenoid.writeSync(1); //set pin state to 1(power solenoid)
    startTime = Date.now();
    setTimeout(offSolenoid, 1000); //release solenoid after 1 seconds
    //setTimeout(endRace(), 5000); //timeout if race isn't completed after 5 sec.
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

function endRace(){
  // for (let i = 0; i < 3; i++) {
  //   document.getElementById("lane"+i+"Time").innerHTML = "-.--- ms";
  //   document.getElementById("lane"+i).src = "src/images/track_with_car.png";
  // }
};

function offSolenoid() { //call back function to power off solenoid
  solenoid.writeSync(0); // Turn solenoid relay off
}

process.on('SIGINT', function () { // Listen to the event triggered on CTRL+C
  Solenoid.writeSync(0); //  Cleanly close the GPIO pin before exiting
  solenoid.unexport();
  process.exit();
});
