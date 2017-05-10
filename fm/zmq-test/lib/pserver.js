var zmq = require("zmq");
const uuid = require('uuid/v4');

// other

class PServer {
  constructor (address) {
    this._services = {};
    this._connections = {};
    this._init = false;

    this._servicesSocket = zmq.socket('sub');
    this._replySocket = zmq.socket("rep");

    this._servicesSocket.bindSync(address);
    this._servicesSocket.subscribe('service_notification');
    this._servicesSocket.on('message', this._onServiceMessage.bind(this));

    this._createServiceListen();
  }

  _createServiceListen () {
    this._listenSock = zmq.socket("pull");

    const ADDRS = "tcp://*:" + 4500;
    const EXTERNAL_ADDS = "tcp://127.0.0.1:" + 4500;

    this._listenSock.bindSync(ADDRS, () => {
      console.log("WAITING CONNECTIONS")
    });

    this._init = false;

    var self = this;

    this._listenSock.on('message', (addr) => {
        self._init = true;

        // Connect to the server instance.
        var replySocket = zmq.socket("rep");

        var identity = uuid();
        self._connections[identity] = replySocket;

        replySocket.connect(addr.toString(), () => {
          console.log('ok')
        });

        // Add a callback for the event that is invoked when we receive a message.
        replySocket.on("message", function (message) {
            console.log(message.toString())
            message = JSON.parse(message.toString('utf8'));

            var service = self._services[message.fn.split('.')[0]];
            console.log(message.fn.split('.')[0],'listening:',!!service)
            if (service)
              service.send(JSON.stringify({fn: message.fn.split('.')[1], value: message.value, identity: identity}));
        });
    });
  }

  _onServiceMessage (msg, msgBody) {
    var body = JSON.parse(msgBody.toString());

    if (!this._services[body.name]) {
      var reply = zmq.socket("rep");

      console.log('discovered:', body.name, body.port);

      this._services[body.name] = reply;
      reply.connect(body.port);

      this._services[body.name].on('message', (r) => {
        var res = JSON.parse(r.toString('utf8'));

        if (res != 'LISTENING') {
          console.log(res, typeof(res))
          this._connections[res.identity].send(res.result);
          // TODO remove pending requests?
          this._connections[res.identity].close();
        }
      });

      var self = this;

      reply.on('close', function () {
        console.log('closed:', body.name, body.port);
        reply.close();
        delete self._services[body.name];
      })

      reply.monitor(10, 0);

      console.log('work: %s', msg.toString(), body.name);
    }
  }
}

var s = new PServer('tcp://127.0.0.1:3001');
