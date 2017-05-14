var pp = require('./lib/ppublish');
var pt = require('./lib/ptalk');

const obj = {
  name: 'world',
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
  port: 'tcp://127.0.0.1:9091',
  _v: '1.2.0'
};

pp.announce(obj, 'tcp://127.0.0.1:3001');

// req_s.js

function ping(a) {
  return 'pong';
}

var fn = {
  ping: ping
}

pt("tcp://127.0.0.1:9091", function (name, params) {
  console.log('ok')
  return fn[name](params);
});
