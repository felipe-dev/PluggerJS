var zmq = require('zmq')
  , sock = zmq.socket('sub');

sock.bindSync('tcp://127.0.0.1:3000');
sock.subscribe('service_notification');

var table = {};

console.log('Worker connected to port 3000');

sock.on('message', function(msg, body){
  var body = JSON.parse(body.toString());
  table[body.name] =
  console.log('work: %s', msg.toString(), JSON.parse(body.name);
});
