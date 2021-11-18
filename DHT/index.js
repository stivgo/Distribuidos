('use strict');
var kad = require('kademlia-dht');
const zmq = require('zeromq');
var fs = require('fs');
const Oferta = require('../Common/Oferta');

let ofertas = [];

const sock = new zmq.Reply();
let DHT1;
let DHT2;
let DHT3;

const main = async () => {
  console.log('Servidor DHT escuchando puerto 8005');
  try {
    await sock.bind('tcp://127.0.0.1:8005');
    for await (const [msg] of sock) {
      console.log(msg);
      if(msg.toString() == "Buscar"){
        let info = getInfo();
        const sendInfo = Buffer.from(JSON.stringify(info));
        await sock.send(sendInfo);
      }
      else{
        let oferta = Oferta.fromJSON(msg);
        console.log(oferta);
        ofertas.push(oferta.toJSON());
        fs.writeFile('test.json', '[' + ofertas.toString() + ']', function (err) {
          if (err) {
            console.log(err);
          }
        });
        setInfo(oferta.id + ' ' + oferta.empleador, oferta);
        getInfo();
        const sendInfo = Buffer.from(JSON.stringify('recepcion DHT'));
        await sock.send(sendInfo);
      }
    }
  } catch (err) {
    sock.send('No inserta la infomación');
    console.log(err);
  }
};
createSpawnNode();
main();

// Store a value on one side and get it back on the other side.
//
function setInfo(key, value) {
  DHT1.set(key, value, function (err) {});
}

function getInfo() {
  /*DHT2.get(key, function (err, value) {
    console.log('valor de la key : ' + key + ' es : ' + value);
  });*/
  console.log('---DHT1 HASH---_');
  console.log(DHT1._locals);
  return DHT1._locals;
}

// Spawn a node. A node is composed of two elements: the local Dht and the Rpc.
//
function spawnNode(endpoint, seeds, cb) {
  kad.MockRpc.spawn(endpoint, function (err, rpc) {
    if (err) return cb(err);
    kad.Dht.spawn(rpc, seeds, function (err, dht) {
      if (err) return cb(err);
      cb(err, dht);
    });
  });
}

function createSpawnNode() {
  spawnNode('localhost:9876', [], function (err, dht1) {
      DHT1 = dht1;
    spawnNode('localhost:4321', [dht1.rpc.endpoint], function (err, dht2) {
      DHT2 = dht2;
    });
    spawnNode('localhost:4322', [dht1.rpc.endpoint], function (err, dht3) {
      DHT3 = dht3;
    });
  });
}
