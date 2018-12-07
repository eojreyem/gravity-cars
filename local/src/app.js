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
    this.finishTime = "";
    this.startTime = "";

    this.startCtl.watch((err, value) => {
      if (err) {
        throw err;
        console.log(err);
      }
      if (startTime === ""){
        if (value == 0){
          document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/track_with_car0.png";
        }else{
          document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/empty_track0.png";
        }
      }
      if (startTime != "" && value ==1){
        if (this.startTime == ""){
          this.startTime = Date.now();
          document.getElementById("lane"+ tracks.findIndex(track => track == this)).src = "src/images/empty_track0.png";
        }

      }

    });

    this.finishCtl.watch((err, value) => {
      if (err) {
        throw err;
        console.log(err);
      }
      console.log("finish beam triggered on lane " + tracks.findIndex(track => track == this));

      if (this.finishTime == "" && this.isRunning){ //unique finish on car that was racing.
        console.log("lane "+ tracks.findIndex(track => track == this) + " Finish!" );
        document.getElementById("award"+ tracks.findIndex(track => track == this)).src = "src/images/"+finishPlace+ "award.png";
        this.isRunning = false;
        finishPlace++;
        this.finishTime = Date.now();
        var time = (this.finishTime - this.startTime)/1000;
        var time3dec = time.toFixed(3);
        document.getElementById("lane"+ tracks.findIndex(track => track == this) +"Time").innerHTML = time3dec + " s";
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
    var numRunning = 0;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].isRunning = !tracks[i].startCtl.readSync(1); //check if car is present and racing
      if (tracks[i].isRunning){
        console.log("Lane "+ i+" is racing!");
        numRunning++;
        //TODO Error no car!
      }
    }
    if (numRunning >0){
      console.log("Spacebar = START!!!");
      document.getElementById("award2").src = "";
      document.getElementById("award1").src = "";
      document.getElementById("award0").src = "";
      document.getElementById("lane0Time").innerHTML = "-.--- s";
      document.getElementById("lane1Time").innerHTML = "-.--- s";
      document.getElementById("lane2Time").innerHTML = "-.--- s";
      solenoid.writeSync(1); //set pin state to 1(power solenoid)
      startTime = Date.now();
      setTimeout(offSolenoid, 1000); //release solenoid after 1 seconds
      setTimeout(endRace, 5000); //timeout after 5 sec.
    }
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
