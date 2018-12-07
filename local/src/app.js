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
        console.log(err);
      }
      if (startTime === ""){
        if (value == 0){
          document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/track_with_car.png";
        }else{
          document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/empty_track.png";
        }
      }

    });

    this.finishCtl.watch((err, value) => {
      if (err) {
        throw err;
        console.log(err);
      }
      console.log("finish beam triggered on lane " + tracks.findIndex(track => track == this));

      if (this.finishTime == ""){ //don't overwrite
        this.finishTime = Date.now();
        this.isRunning = false;
        console.log("lane "+ tracks.findIndex(track => track == this) + " Finish!" );
        document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/track_with_award"+finishPlace+ ".png";
        finishPlace++;
        var time = (this.finishTime - startTime)/1000;
        var time3dec = time.toFixed(3);
        document.getElementById("lane"+ tracks.findIndex(track => track == this) +"Time").innerHTML = time3dec + " s";
        //check if any cars are running?
        var carsRunning = 0;
        for (let i = 0; i < tracks.length; i++) {
          carsRunning += tracks[i].isRunning;
        };
        if (carsRunning == 0){
          endRace();
        };
      }
    });
  }
}

//initialize output pin for solenoid car release
solenoid = new Gpio(config.solenoidPin, 'out');
console.log("solenoid configured");

//initialize all tracks per config json
for (let i = 0; i < config.startBeamPins.length; i++) {  // create tracks for each startBeamPins.
  tracks[i] = new Track(config.startBeamPins[i], config.finishBeamPins[i]);
  console.log("track " +i+ " configured");
}

//Start Race when spacebar is pressed.
document.onkeyup = function(e){

  if(e.keyCode == 32 && startTime == ""){   // function run if spacebar is pressed.

    for (let i = 0; i < tracks.length; i++) {
      tracks[i].isRunning = !tracks[i].startCtl.readSync(1); //check if car is present and racing
      if (tracks[i].isRunning){
        console.log("Lane "+ i+" is racing!");
        //TODO Error no car!
      }
    }
    console.log("Spacebar = START!!!");
    solenoid.writeSync(1); //set pin state to 1(power solenoid)
    startTime = Date.now();
    setTimeout(offSolenoid, 1000); //release solenoid after 1 seconds
    //setTimeout(endRace, 5000); //timeout after 5 sec.
  }
}

function endRace(){
  console.log("END RACE");
  startTime = "";
  finishPlace = 1;
  for (let i = 0; i < config.startBeamPins.length; i++) {  // clear race data
    console.log("reset track file"+i);
    tracks[i].finishTime = "";
    tracks[i].isRunning = false;
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
