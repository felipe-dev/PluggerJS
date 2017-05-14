var plugger = require('./lib/plugger')("tcp://127.0.0.1:4500");

setInterval(() => {
  plugger.exec('hello.dobra', 4).then((value) => {
    console.log(value);
  });
}, 700);

setInterval(() => {
  plugger.exec('world.ping').then((value) => {
    console.log(value);
  });
}, 300);
