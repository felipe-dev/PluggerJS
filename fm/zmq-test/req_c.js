var zmq = require("zmq");
var socket = zmq.socket("rep");
const uuid = require('uuid/v4');


var random_port = require('random-port');
var ADDRS = "tcp://*:" + 4500;
var EXTERNAL_ADDS = "tcp://127.0.0.1:" + 4500;

var pull = zmq.socket("pull");


pull.bind(ADDRS, () => {
  console.log("WAITING CONNECTIONS")
});

var init = false;

pull.on('message', (adds) => {

  if (!init) {
    init = true;
    // Just a helper function for logging to the console with a timestamp.
    function logToConsole (message) {
        console.log("[" + new Date().toLocaleTimeString() + "] " + message);
    }

    // Add a callback for the event that is invoked when we receive a message.
    socket.on("message", function (message) {
        // Convert the message into a string and log to the console.
        //logToConsole("Received message: " + message.toString("utf8"));
        console.log(message.toString())
        message = JSON.parse(message.toString('utf8'));
        console.log(!!table[message.fn.split('.')[0]])
        // Send the message back aa a reply to the server.
        var s = table[message.fn.split('.')[0]];
        if (s)
          s.send(JSON.stringify({fn: message.fn.split('.')[1], value: message.value}));
        socket.send(uuid());
    });

    // Connect to the server instance.
    socket.connect(adds.toString('utf8'));
  }
});

// other

sub = zmq.socket('sub');

sub.bindSync('tcp://127.0.0.1:3001');
sub.subscribe('service_notification');

var table = {};

console.log('Worker connected to port 3000');

sub.on('message', function(msg, body){
  var body = JSON.parse(body.toString());

  if (!table[body.name]) {
    var repSock = zmq.socket("rep");
    console.log('discovered:', body.name, body.port)
    table[body.name] = repSock.connect(body.port);

    table[body.name].on('message', (r) => {
      if (r.toString() != 'WAIT') {
        console.log(r.toString());
        socket.send(r.toString());
      }
    });

    console.log('work: %s', msg.toString(), body.name);
  }
});
