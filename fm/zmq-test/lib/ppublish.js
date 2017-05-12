var zmq = require('zmq');

class PPublish {
  constructor (properties, serverAddress) {
    this._properties = Buffer.from(JSON.stringify(properties), 'utf8');
    this._serverAddress = serverAddress;
    this._initialize();

    this._connect();
  }

  _connect () {
    this._sock.connect(this._serverAddress);
  }

  _initialize () {
    var self = this;

    this._sock = zmq.socket('pub');
    // TODO onConnect?
    /*setTimeout(() => {
      self._sock.on('disconnect', function () {
        console.log('closed')
        self._connect();
      });

      self._sock.monitor(1, 0);
    }, 0)*/
  }

  announce (interval = 500) {
    var self = this;

    setInterval(function() {
      self._sock.send(['service_notification', self._properties]);
    }, interval);
  }
}

module.exports.announce = function (properties, server) {
  new PPublish(properties, server).announce();
};
