
var zmq = require('zmq');

class PTalk {
  constructor (addr, fcall) {
    this._address = addr;
    this._fcall = fcall;
    this._initialize();
  }

  _initialize () {
    this._sock = zmq.socket('req');
    this._bindSock(this._address);
  }

  _bindSock(addr) {
    var self = this;

    this._sock.bind(addr, function (error) {
      if (error) {
        console.log("Failed to bind socket: " + error.message);
        process.exit(0);
      } else {
        console.log("Running in", addr);
        self._sendMessage('LISTENING');
        self._sock.monitor(500, 0);
      }
    });

    // TODO try connect?
    this._sock.on('disconnect', function () {
      console.log('closed')
      self._sock.close();
      self._initialize();
    });

    this._sock.on('message', this._onMessage.bind(this));
  }

  _sendMessage (message) {
    this._sock.send(JSON.stringify(message));
  }

  _onMessage (msg) {
    console.log('_onMessage', msg)
    msg = JSON.parse(msg.toString('utf8'));
    console.log(JSON.stringify(msg))

    this._sendMessage({result: this._fcall(msg.fn, msg.value), identity: msg.identity, options: msg.options});
  }
}

module.exports = function (addr, fcall) {
  new PTalk(addr, fcall);
};
