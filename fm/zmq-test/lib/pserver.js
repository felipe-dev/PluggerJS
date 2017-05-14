var zmq = require("zmq");
const uuid = require('uuid/v4');
const log = require('./utils').log;
const chalk = require('chalk');

class PServer {
  constructor (address) {
    this._services = {};
    this._connections = {};
    this._init = false;

    this._servicesSocket = zmq.socket('sub');

    this._servicesSocket.bindSync(address);
    this._servicesSocket.subscribe('service_notification');
    this._servicesSocket.on('message', this._onServiceMessage.bind(this));

    this._createServiceListen();
  }

  _createServiceListen () {
    this._listenSock = zmq.socket("pull");

    const ADDRS = "tcp://*:" + 4500;
    const EXTERNAL_ADDS = "tcp://127.0.0.1:" + 4500;

    this._listenSock.bindSync(ADDRS);

    this._init = false;

    var self = this;

    this._listenSock.on('message', (msg) => {
        var object = JSON.parse(msg.toString());
        var objectId = object.id;

        if (!self._connections[objectId]) {

          log(chalk.bold.blue('[message received]'), object.addr)

          // Connect to the server instance.
          var replySocket = zmq.socket("rep");

          self._connections[objectId] = replySocket;

          replySocket.connect(object.addr);

          // Add a callback for the event that is invoked when we receive a message.
          replySocket.on("message", function (message) {
            console.log('ok')
              message = JSON.parse(message.toString('utf8'));

              let service = self._services[message.fn.split('.')[0]];

              log(chalk.bold.blue('[module request]'), message.fn, '|', objectId);
              log(!!service ? chalk.bold.green('[module ' + message.fn + ' on]') : chalk.bold.red('[module ' + message.fn + ' off]'));

              if (service) {
                service.send(JSON.stringify({fn: message.fn.split('.')[1], value: message.value,
                  identity: objectId, options: message.options}));
              } else {
                // rep socket deve sempre retornar algo, só pode retornar uma unica vez e um de cada vez
                replySocket.send(JSON.stringify({'result': 'ok', 'options': message.options}));
              }
          });

          replySocket.on('close', () => {
            replySocket.unmonitor();
            delete self._connections[objectId];
          })

          replySocket.monitor(500, 0);
        }
    });
  }

  _onServiceMessage (msg, msgBody) {
    var body = JSON.parse(msgBody.toString());

    if (!this._services[body.name]) {
      var reply = zmq.socket("rep");
        console.log(arguments)

      log(chalk.bold.green('[module discovered]'), body.name, '|', body.port);

      this._services[body.name] = reply;
      reply.connect(body.port);

      this._services[body.name].on('message', (r) => {
        var res = JSON.parse(r.toString('utf8'));

        if (res != 'LISTENING') {
          log(chalk.bold.white('[result]'), res.identity);

          this._connections[res.identity].send(JSON.stringify({result: res.result, options: res.options}));
          //this._connections[res.identity].close();

          //delete this._connections[res.identity];
        }
      });

      var self = this;

      reply.on('close', function () {
        log(chalk.bold.red('[module closed]'), body.name, '|', body.port);
        reply.unmonitor();
        delete self._services[body.name];
      });

      reply.monitor(500, 0);
    }
  }
}

var s = new PServer('tcp://127.0.0.1:3001');
