var zmq = require('zeromq'),
  sock = zmq.socket('sub');

sock.connect('tcp://127.0.0.1:3000');
sock.subscribe('kitty cats');
console.log('Subscriber connected to port 3000');

sock.on('message', function (topic, message) {
  const { oferta, oferta2 } = Object(message);
  console.log('Objeto', Object(message), String(oferta));
  console.log(
    'received a message related to:',
    String(topic),
    'containing message:',
    oferta,
    oferta2
  );
});
