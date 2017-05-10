var pp = require('./lib/ppublish');
var pt = require('./lib/ptalk');

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

pp.announce(obj, 'tcp://127.0.0.1:3001');

// req_s.js

function dobra(a) {
  return Number(a) * 2;
}

var fn = {
  dobra: dobra
}

pt("tcp://127.0.0.1:9090", function (name, params) {
  console.log('ok')
  return fn[name](params);
});
