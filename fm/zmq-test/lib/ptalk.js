
var zmq = require('zmq');

class PTalk {
  constructor (addr, fcall) {
    this._sock = zmq.socket('req');
    this._bindSock(addr);
    // TODO change to event?
    this._fcall = fcall;
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
      }
    });

    this._sock.on('message', this._onMessage.bind(this));
  }

  _sendMessage (message) {
    this._sock.send(JSON.stringify(message));
  }

  _onMessage (msg) {
    console.log('_onMessage', msg)
    msg = JSON.parse(msg.toString('utf8'));
    console.log( msg.identity)

    this._sendMessage({result: this._fcall(msg.fn, msg.value), identity: msg.identity});
  }
}

module.exports = function (addr, fcall) {
  new PTalk(addr, fcall);
};
