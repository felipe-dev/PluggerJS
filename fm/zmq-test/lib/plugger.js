var zmq = require("zmq");
const utils = require('./utils');
const uuid = require('uuid/v4');

class Plugger {
  constructor (serverAddr) {
    this._orders = {};

    this._requestSocket = zmq.socket('req');

    this._connect(serverAddr);
    this._initialized = false;
  }

  _connect (serverAddr) {
    var self = this;

    utils.rndPort().then((port) => {
      var addr = "tcp://*:" + port;

      var serverSocket = zmq.socket('push');
      serverSocket.connect(serverAddr);

      setInterval(function () {
          serverSocket.send("tcp://127.0.0.1:" + port);
      }, 1000);

      self._requestSocket.bind(addr, function (error) {
        if (error) {
          self._logToConsole("Failed to bind socket: " + error.message);
          process.exit(0);
        }
        else {
          self._logToConsole("Server listening on port 9998");
          self._initialized = true;
        }
      });

      this._requestSocket.on('message', self._onRequestSocketMessage.bind(self));
    }).catch((err) => console.log(err));
  }

  _onRequestSocketMessage (msg) {
    msg = JSON.parse(msg);
    this._orders[msg.options.orderId][0](msg.result);
    delete this._orders[msg.options.orderId];
  }

  _logToConsole (message) {
      console.log("[" + new Date().toLocaleTimeString() + "] " + message);
  }

  _sendMessage (msg) {
    this._requestSocket.send(JSON.stringify(msg));
  }

  exec (fn, params) {
    var self = this;

    function executePromise() {
      return new Promise ((resolve, reject) => {
        var orderId = uuid();

        var options = {
          orderId: orderId
        };

        self._orders[orderId] = [resolve, reject];

        self._sendMessage({fn: fn, value: params, options: options});
      });
    }

    if (!this._initialized) {
      return new Promise ((resolve, reject) => {
        function timeout() {
          setTimeout(() => {
            if (!self._initialized) {
              timeout();
            } else {
              resolve();
            }
          }, 500);
        }

        timeout();
      }).then(executePromise).catch((err) => console.log(err));
    } else {
      return executePromise();
    }
  }
}

module.exports = function (serverAddr) {
  return new Plugger(serverAddr);
};
