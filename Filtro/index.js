const express = require('express');
const Oferta = require('../Common/Oferta.js');

let ofertas = []

// Comunicación entre empleador y Aspirante
const zmq = require('zeromq');
const sockPub = new zmq.Publisher();
const sockSub = new zmq.Subscriber();

// Comunicación entre DHT
const sockDHT = new zmq.Request();

const servidor = express();
servidor.use(express.json());

servidor.use((err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal error' });
  } else {
    next();
  }
});

async function sockSubOn() {
  for await (const [topic, msg] of sockSub) {
    console.log('Topic: ',String(topic),'\n','Message: ',JSON.parse(msg));
    let oferta = Oferta.fromJSON(msg);
    ofertas.push(oferta);
    try {
      console.log("Info a enviar:\n"+oferta.toJSON());
      await sockDHT.send(oferta.toJSON());
      const [result] = await sockDHT.receive();
      const resultParse = JSON.parse(result.toString());
      console.log(resultParse)
    } catch (error) {
      console.log(error);
    }
  }
}

servidor.listen(3001, () => {
  sockSub.connect('tcp://127.0.0.1:8001');
  sockSub.subscribe('Ofertas');
  console.log('Subscriber connected to port 8001');
  sockDHT.connect('tcp://127.0.0.1:8002');
  console.log('SeverDHT bound to port 8002');
  sockSubOn();
  console.log('Servidor Filtro escuchando puerto 3001');
});