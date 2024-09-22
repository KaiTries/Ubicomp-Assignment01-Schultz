/*
Feeds accelerometer data into pretrained neural network
*/



/*
Variable
*/
var start = false; // need to get initial 20 readings
var strideLength = 1; // sliding window size (1 - 20) -> how often to call model
var i = 0; // holds current position in window (0 -19)
var x = 0; // holds normalized x reading
var y = 0; // holds normalized y reading
var z = 0; // holds normalized z reading
var min = -32768; // min reading value of accelerometer (puck.js)
var max = 32768; // max reading value of acceleromter (puck.js)
var minInt = -127; // min expected value in model
var maxInt = 127; // max expected value in model

var window = [20]; // actual window


/*
functions 
*/


// normalizes the given value to a valid integer
var normalize = function(x) {
  return parseInt(minInt + (x - min) * (maxInt - minInt) / (max - min));
};

// evaluates the model based on the current window
var evaluate = function() {
  for(var i = 0; i < 20; i++) {
    Infxl.insert(i,window[i][0],window[i][1],window[i][2]);
  }
  return Infxl.model();
};

// checks if model should be evaluated again
var newWindow = function() {
  return i % strideLength == 0;
};

// function to be run on accelerometer input
Puck.on('accel', function(data) {
  x = normalize(data.acc.x);
  y = normalize(data.acc.y);
  z = normalize(data.acc.z);
  if(!start) {
    window[i] = ([x,y,z]);
    i = (i + 1) % 20;
    if(i==0){
      start = true;
      console.log(evaluate());
    }
  } else {
    i = (i + 1) % 20; // still need to track some index for stride
    window.shift(); // O(n) operation bad -> space > time ? array : linked-list
    window.push([x,y,z]);
    if(newWindow()) {
    console.log(evaluate());
    }
  }
});

/*
// old function without sliding window
// technically sliding window but new values do not get added as last index
// they just cicle through 0 -19 so could conflict with model
Puck.on('accel', function(data) {
  x = normalize(data.acc.x);
  y = normalize(data.acc.y);
  z = normalize(data.acc.z);

  Infxl.insert(i,x,y,z);
  i = (i + 1)%20;
  if(!start) {
    if(i == 0) {
      start = true;
    }
  } else {
    if (i % strideLength == 0) {
     console.log(Infxl.model());
    }
  }
});

*/

/*
program
*/
Puck.accelOn(12.5); // default is 12.5 either way so can leave empty
