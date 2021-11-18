const express = require('express');
const Oferta = require('../Common/Oferta.js');

let ofertas = [];

// Comunicación entre Empleador
const zmq = require('zeromq');
const sockPubEmpleador = new zmq.Publisher();
const sockSubEmpleador = new zmq.Subscriber();

//Comunnicación entre Aspirante
const sockPubAspirante = new zmq.Publisher();
const sockSubAspirante = new zmq.Subscriber();

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

async function sockSubEmpleadorOn() {
  for await (const [topic, msg] of sockSubEmpleador) {
    console.log('Topic: ', String(topic), '\n', 'Message: ', JSON.parse(msg));
    let oferta = Oferta.fromJSON(msg);
    ofertas.push(oferta);
    try {
      console.log('Info a enviar:\n' + oferta.toJSON());
      await sockDHT.send(oferta.toJSON());
      const [result] = await sockDHT.receive();
      const resultParse = JSON.parse(result.toString());
      console.log(resultParse);
    } catch (error) {
      console.log(error);
    }
    console.log('termine');
  }
}

async function enviarMensajeEmpleador(msg) {
  const buf = Buffer.from(JSON.stringify(msg));
  await sockPubEmpleador.send(['Respuesta', buf]);
}

async function sockSubAspiranteOn() {
  for await (const [topic, msg] of sockSubEmpleador) {
    console.log('Topic: ', String(topic), '\n', 'Message: ', JSON.parse(msg));
    let oferta = Oferta.fromJSON(msg);
    ofertas.push(oferta);
    try {
      console.log('Info a enviar:\n' + oferta.toJSON());
      await sockDHT.send(oferta.toJSON());
      const [result] = await sockDHT.receive();
      const resultParse = JSON.parse(result.toString());
      console.log(resultParse);
    } catch (error) {
      console.log(error);
    }
  }
}

async function enviarMensajeAspirante(msg) {
  const buf = Buffer.from(JSON.stringify(msg));
  await sockPubAspirante.send(['Respuesta', buf]);
}

servidor.listen(3001, () => {
  sockSubEmpleador.connect('tcp://127.0.0.1:8001');
  sockSubEmpleador.subscribe('Ofertas');
  sockSubEmpleadorOn();
  console.log('Subscriber Empleador connected to port 8001');

  await sockPubEmpleador.bind('tcp://127.0.0.1:8002');
  console.log('Publisher Empleador to sport 8002');

  sockSubAspirante.connect('tcp://127.0.0.1:8003');
  sockSubAspirante.subscribe('Ofertas');
  sockSubAspiranteOn();
  console.log('Subscriber Aspirante connected to port 8003');

  await sockPubAspirante.bind('tcp://127.0.0.1:8004');
  console.log('Publisher Empleador to sport 8004');

  sockDHT.connect('tcp://127.0.0.1:8005');
  console.log('SeverDHT bound to port 8005');

  console.log('Servidor Filtro escuchando puerto 3001');
});
