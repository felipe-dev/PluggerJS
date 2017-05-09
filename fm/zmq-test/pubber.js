// pubber.js
var zmq = require('zmq')
  , sock = zmq.socket('router');

sock.connect('tcp://127.0.0.1:3000');
//sock.bindSync('tcp://127.0.0.1:3000');
console.log('Publisher bound to port 3000');

setInterval(function(){
  console.log('sending a multipart message envelope');
  sock.send(['kitty cats', 'meow!']);
}, 500);

var StringDecoder = require('string_decoder').StringDecoder;

sock.on('message', function(topic, message) {
 var decoder = new StringDecoder('utf8');
 message = decoder.write(message);
  console.log('received a message related to:', topic, 'containing message:', message);
});
