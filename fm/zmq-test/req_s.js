var zmq = require("zmq");
var socket = zmq.socket("req");
var counter = 0;

var random_port = require('random-port');
random_port({from: 20000}, (rnd) => {
  var ADDRS = "tcp://*:" + rnd;
  var EXTERNAL_ADDS = "tcp://127.0.0.1:" + rnd;

  console.log(ADDRS)
  var push = zmq.socket('push');

  push.connect("tcp://127.0.0.1:4500");

  setInterval(function () {
    push.send(EXTERNAL_ADDS);
  }, 1000)

  // Just a helper function for logging to the console with a timestamp.
  function logToConsole (message) {
      console.log("[" + new Date().toLocaleTimeString() + "] " + message);
  }

  function sendMessage (message) {
      logToConsole("Sending: " + message);
      socket.send(message);
  }

  // Add a callback for the event that is invoked when we receive a message.
  socket.on("message", function (message) {
      // Convert the message into a string and log to the console.
      logToConsole("Response: " + message.toString("utf8"));
  });

  // Begin listening for connections on all IP addresses on port 9998.
  socket.bind(ADDRS, function (error) {
      if (error) {
          logToConsole("Failed to bind socket: " + error.message);
          process.exit(0);
      }
      else {
          logToConsole("Server listening on port 9998");

          // Increment the counter and send the value to the clients every second.
          setInterval(function () { sendMessage(JSON.stringify({fn: "hello.dobra", value: 7})) }, 1000);
      }
  });
});
