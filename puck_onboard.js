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
var min = -32768 / 2; // min reading value of accelerometer (puck.js) 4g / 2 => val for 2g
var max = 32768 / 2; // max reading value of acceleromter (puck.js)
var minInt = -127; // min expected value in model
var maxInt = 127; // max expected value in model

var window = [60]; // actual window

/*
functions 
*/
function shiftWindow(xVal, yVal, zVal) {
    window.shift();
    window.shift();
    window.shift();
    window.push(x);
    window.push(y);
    window.push(z);
}

// normalizes the given value to a valid integer
var normalize = function (numberToNormalise) {
  return parseInt(minInt + ((numberToNormalise - min) * (maxInt - minInt)) / (max - min));
};

// evaluates the model based on the current window
var evaluate = function () {
  for (var idx = 0; idx < 20; idx++) {
    Infxl.insert(idx, window[idx * 3], window[idx * 3 + 1], window[idx * 3 + 2]);
  }
  return Infxl.model();
};

// checks if model should be evaluated again
var newWindow = function () {
  return i % strideLength == 0;
};

// function to be run on accelerometer input
Puck.on("accel", function (data) {
  x = normalize(Math.max(min,Math.min(max,data.acc.x)));
  y = normalize(Math.max(min,Math.min(max,data.acc.y)));
  z = normalize(Math.max(min,Math.min(max,data.acc.z)));
  if (!start) {
    window[i * 3] = x;
    window[i * 3 + 1] = y;
    window[i * 3 + 2] = z;
    i = (i + 1) % 20;
    if (i == 0) {
      start = true;
      console.log(evaluate());
    }
  } else {
    i = (i + 1) % 20; // still need to track some index for stride
    shiftWindow(y,y,z);
    if (newWindow()) {
      console.log(evaluate());
    }
  }
});


Puck.accelOn(12.5); // default is 12.5 either way so can leave empty
