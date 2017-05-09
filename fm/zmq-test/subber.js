// subber.js
var StringDecoder = require('string_decoder').StringDecoder;

var zmq = require('zmq')
  , sock = zmq.socket('dealer');

sock.bind('tcp://127.0.0.1:3001');
sock.subscribe('kitty cats');
console.log('Subscriber connected to port 3000');

setInterval(() => {
  sock.send(['peixe', 'frito']);
}, 1000);

sock.on('message', function(topic, message) {
 var decoder = new StringDecoder('utf8');
 message = decoder.write(message);
  console.log('received a message related to:', topic, 'containing message:', message);
});
