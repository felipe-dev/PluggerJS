var plugger = require('./lib/plugger')("tcp://127.0.0.1:4500");

plugger.exec('hello.dobra', 4).then((value) => {
  console.log(value);
});
