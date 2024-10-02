var dataX = [];
var dataY = [];
var dataZ = [];

var gettingData;

var min = -32768 / 2; // min reading value of accelerometer (puck.js)
var max = 32768 / 2; // max reading value of acceleromter (puck.js)
var minInt = -127; // min expected value in model
var maxInt = 127; // max expected value in model

var normalize = function (x) {
  return parseInt(minInt + ((x - min) * (maxInt - minInt)) / (max - min));
};

function extractDataFromResponse(response) {
  if (response != null) {
    var xReading = normalize(Math.max(min,Math.min(max,response.x)));
    var yReading = normalize(Math.max(min,Math.min(max,response.y)));
    var zReading = normalize(Math.max(min,Math.min(max,response.z)));
    xReading = xReading == -0 ? 0 : xReading;
    yReading = yReading == -0 ? 0 : yReading;
    zReading = zReading == -0 ? 0 : zReading;

    if(dataX.length == 20) {
      dataX.shift();
      dataY.shift();
      dataZ.shift();
    }

    dataX.push(xReading);
    dataY.push(yReading);
    dataZ.push(zReading);
  } else {
    console.log("No response");
  }
}

function doClassification() {
  if (dataX.length == 20) {
    var sensorData = [];
    for (var i = 0; i < 20; i++) {
      sensorData.push(dataX[i]);
      sensorData.push(dataY[i]);
      sensorData.push(dataZ[i]);
    }
    var result = classify(sensorData);

    document.getElementById("result").innerText = "Prediction: " + result.indexOf(Math.max(...result));
  }
  return null;
}

function makeChart() {
  var trace = {
    x: dataX,
    y: dataY,
    z: dataZ,
    mode: "markers",
    marker: {
      size: 12,
      symbol: "circle",
      line: {
        color: "rgba(217, 217, 217, 0.14)",
        width: 1,
      },
      opacity: 0.8,
    },
    type: "scatter3d",
  };

  var data = [trace];
  var layout = {
    xaxis: { range: [-140, 140], fixedrange: true },
    yaxis: { range: [-140, 140], fixedrange: true },

    scene: {
      xaxis: { range: [-140, 140], fixedrange: true },
      yaxis: { range: [-140, 140], fixedrange: true },
      zaxis: { range: [-140, 140], fixedrange: true },
      aspectratio: {
        x: 0,
        y: 0,
        z: 0,
      },
      aspectmode: "cube",
    },
  };
  Plotly.newPlot("myChart", data, layout);
}

function receiveData() {
  if (UART.isConnected()) {
    gettingData = window.setInterval(function () {
      getData();
    }, 50);
  }
}
function connect() {
  UART.eval("Puck.accelOn(12.5)", function (response) {
    console.log(response);
  });
}

function getData() {
  UART.eval("Puck.accel()", function (response) {
    var accData = response.acc;
    document.getElementById("sensordata").value =
      "Raw SensorData: x: " +
      accData.x +
      ", y; " +
      accData.y +
      ", z: " +
      accData.z;
    extractDataFromResponse(accData);
    makeChart();
    doClassification();
  });
}

function disconnect() {
  if (UART.isConnected) {
    clearInterval(gettingData);
    UART.eval("Puck.accelOff()", function (response) {
      console.log(response);
    });
    UART.close();
  }
}

//This helper function copies the accelerometer data to the clipboard for testing
function copy() {
  var copyText = document.getElementById("sensordata");
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */
  navigator.clipboard.writeText(copyText.value);
  alert("Copied the text: " + copyText.value);
}
