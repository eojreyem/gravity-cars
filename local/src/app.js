const Gpio = require('onoff').Gpio; // Import the onoff library

const config = {
  "solenoidPin":27,
  "startbtnPin":23,
  "startbtnLEDPin":22,
  "startBeamPins":[21,20,16],
  "finishBeamPins":[7,8,25]
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
          document.getElementById("car"+ tracks.findIndex(track => track == this)).src = "src/images/car.png";
        }else{
          document.getElementById("car"+ tracks.findIndex(track => track == this)).src = "";
        }
      }
      if (startTime != "" && value ==1){
        document.getElementById("car"+ tracks.findIndex(track => track == this)).src = "";
      }

    });

    this.finishCtl.watch((err, value) => {
      if (err) {
        throw err;
        console.log(err);
      }
      //console.log("finish beam triggered on lane " + tracks.findIndex(track => track == this));

      if (this.finishTime == "" && this.isRunning){ //unique finish on car that was racing.
        document.getElementById("statusText").innerHTML = "";
        //console.log("lane "+ tracks.findIndex(track => track == this) + " Finish!" );
        document.getElementById("award"+ tracks.findIndex(track => track == this)).src = "src/images/"+finishPlace+ "award.png";
        this.isRunning = false;
        finishPlace++;
        this.finishTime = Date.now();
        var time = (this.finishTime - startTime)/1000;
        var time3dec = time.toFixed(3);
        document.getElementById("lane"+ tracks.findIndex(track => track == this) +"Time").innerHTML = time3dec;
      }
    });
  }
}

//initialize output pin for solenoid car release
solenoid = new Gpio(config.solenoidPin, 'out');
//console.log("solenoid configured");

//initialize pins for start button
startBtn = new Gpio(config.startbtnPin, 'in', 'rising', {debounceTimeout: 10});
startBtnLED = new Gpio(config.startbtnLEDPin, 'out');
startBtnLED.writeSync(1); //set pin state to 1(LED on)
//console.log("start Button configured");

//initialize all tracks per config json
for (let i = 0; i < config.startBeamPins.length; i++) {  // create tracks for each startBeamPins.
  tracks[i] = new Track(config.startBeamPins[i], config.finishBeamPins[i]);
  //console.log("track " +i+ " configured");
}

//When start button is pressed ...
startBtn.watch((err, value) => {
  if (err) {
    throw err;
  }
  if(startTime == ""){
    var numRunning = 0;
    //check if any cars are present and ready for racing
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].isRunning = !tracks[i].startCtl.readSync(1);
      if (tracks[i].isRunning){
        //console.log("Lane "+ i+" is racing!");
        numRunning++;
      }
    }
    if (numRunning >0){
      startBtnLED.writeSync(0); //set pin state to 0(LED off)
      document.getElementById("award2").src = "";
      document.getElementById("award1").src = "";
      document.getElementById("award0").src = "";
      document.getElementById("statusText").style.color = "green";
      document.getElementById("statusText").innerHTML = "Go Go GO!!!";
      setTimeout(statusTextOff, 1500); //turn off message after 5 sec.
      document.getElementById("lane0Time").innerHTML = "0.000";
      document.getElementById("lane1Time").innerHTML = "0.000";
      document.getElementById("lane2Time").innerHTML = "0.000";
      solenoid.writeSync(1); //set pin state to 1(power solenoid)
      startTime = Date.now();
      setTimeout(offSolenoid, 1000); //release solenoid after 1 seconds
      setTimeout(endRace, 5000); //timeout after 5 sec.
    }else {
    document.getElementById("statusText").style.color = "white";
      document.getElementById("statusText").innerHTML = "No Cars.";
      setTimeout(statusTextOff, 1500); //turn off message after 2 sec.
    }
  }
});

function endRace(){
  document.getElementById("statusText").innerHTML = "";
  startBtnLED.writeSync(1); //set pin state to 1(LED on)
  startTime = "";
  finishPlace = 1;
  for (let i = 0; i < config.startBeamPins.length; i++) {  // clear race data
    //console.log("reset track file"+i);
    tracks[i].finishTime = "";
    tracks[i].isRunning = false;
  }
};

function statusTextOff() {
  document.getElementById("statusText").innerHTML = "";
}

function offSolenoid() { //call back function to power off solenoid
  solenoid.writeSync(0); // Turn solenoid relay off
}

process.on('SIGINT', function () { // Listen to the event triggered on CTRL+C
  Solenoid.writeSync(0); //  Cleanly close the GPIO pin before exiting
  solenoid.unexport();
  startBtn.unexport();
  startBtnLED.unexport();
  process.exit();
});
