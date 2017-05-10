var zmq = require('zmq');

class PPublish {
  constructor (properties, connectionInfo) {
    this._properties = properties;
    this._connectionInfo = connectionInfo;

    this._sock = zmq.socket('pub');

    this._sock.connect(connectionInfo.server);
  }

  announce (interval = 500) {
    setInterval(function() {
      this._sock.send(['service_notification', this._properties]);
    }, 500);
  }
}

module.exports = PPublish;
