var zmq = require('zmq')
  , sock = zmq.socket('pub');

sock.connect('tcp://127.0.0.1:3001');
console.log('Producer bound to port 3001');

const obj = {
  name: 'hello',
  services: [
    {
      name: 'create',
      type: 'no_callback'
    },
    {
      name: 'read',
      type: 'async_callback'
    }
  ],
  port: 'tcp://127.0.0.1:9090',
  _v: '1.2.0'
};

const bf = Buffer.from(JSON.stringify(obj), 'utf8');

setInterval(function(){
  console.log('sending work');
  sock.send(['service_notification', bf]);
}, 500);

function dobra(a) {
  return Number(a) * 2;
}

// req_s.js

var socket = zmq.socket("req");
var counter = 0;

// Just a helper function for logging to the console with a timestamp.
function logToConsole (message) {
    console.log("[" + new Date().toLocaleTimeString() + "] " + message);
}

function sendMessage (message) {
    logToConsole("Sending: " + message);
    socket.send(message);
}

var fn = {
  dobra: dobra
}

// Add a callback for the event that is invoked when we receive a message.
socket.on("message", function (message) {
    console.log('kdjfnjndfj')
    // Convert the message into a string and log to the console.
    logToConsole("Response: " + message.toString("utf8") + 'ok');
    message = JSON.parse(message.toString("utf8"));
    sendMessage(fn[message.fn](message.value))
});

// Begin listening for connections on all IP addresses on port 9998.
socket.bind("tcp://127.0.0.1:9090", function (error) {
    if (error) {
        logToConsole("Failed to bind socket: " + error.message);
        process.exit(0);
    }
    else {
        logToConsole("Server listening on port 9090");
        sendMessage("WAIT");
        //sendMessage('ok')
        // Increment the counter and send the value to the clients every second.
        //setInterval(function () { sendMessage(counter++); }, 1000);
    }
});
