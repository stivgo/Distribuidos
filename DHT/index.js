('use strict');
var kad = require('kademlia-dht');
const zmq = require('zeromq');
const Oferta = require('../Common/Oferta');

const sock = new zmq.Reply();
let DHT1;
let DHT2;

const main = async () => {
  
  console.log('Servidor DHT escuchando puerto 8002');
  try {
    await sock.bind('tcp://127.0.0.1:8002');
    for await (const [msg] of sock) {
      //Se recibe una ofreta, solo falta guardarla
      let oferta = Oferta.fromJSON(msg);
      console.log(oferta);
      //Antes había una cosa llamada data pero ahora la idea sería guardar la oferta
      let b = Buffer.from(data);
      let s = b.toString('utf-8');
      let o = JSON.parse(s);
      o.map(element=> setInfo(element.idEmpleador+element.idOferta, 
        element.Clasificacion+" "+element.Nombre))
      console.log(o)
      getInfo('110')
      const sendInfo = Buffer.from(JSON.stringify('recepcion DHT'));
      await sock.send(sendInfo);
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
  DHT1.set(key, value, function (err) {
    
  });
}

function getInfo(key) {
  DHT2.get(key, function (err, value) {
    console.log("valor de la key : "+ key+ " es : " + value);
  });
  console.log("---DHT1 HASH---_")
  console.log(DHT1._locals)
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
    spawnNode('localhost:4321', [dht1.rpc.endpoint], function (err, dht2) {
      DHT1 = dht1;
      DHT2 = dht2;
    });
  });
}

