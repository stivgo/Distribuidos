const express = require('express');
const Oferta = require('../Common/Oferta.js');
let sectores = [];

const zmq = require('zeromq');
const sockPubFiltro = new zmq.Publisher();
const sockSubFiltro = new zmq.Subscriber();

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

servidor.post('/aspirante', async (req, res, next) => {
  console.log(req.body);
  try {
    const buf = Buffer.from(JSON.stringify(req.body));
    await sockPubFiltro.send(['Ofertas', buf]);
    res.status(201).json({ data: 'Se envio hoja de vida' });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

servidor.post('/aspirante/sub', async (req, res, next) => {
  console.log(req.body);
  try {
    let buffer = Buffer.from(JSON.stringify(req.body));
    const sector = JSON.parse(buffer).sector;
    sectores.push(sector);
    console.log("Estas suscrito a: " + sectores);
    res.status(201).json({ data: 'Se suscribió a ese sector' });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

async function sockSubFiltroOn() {
  for await (const [topic, msg] of sockSubFiltro) {
    console.log('Topic: ',String(topic),'\n','Message: ',JSON.parse(msg));
    let oferta = Oferta.fromJSON(msg);
    try {
      console.log("Tiene una nueva oferta :\n"+oferta.toJSON());
    } catch (error) {
      console.log(error);
    }
    console.log("termine")
  }
}

servidor.listen(3002, async () => {
  await sockPubFiltro.bind('tcp://127.0.0.1:8003');
  console.log('Publisher bound to sport 8003');
  
  sockSubFiltro.connect('tcp://127.0.0.1:8004');
  sockSubFiltro.subscribe('Respuesta');
  console.log('Subscriber Empleador connected to port 8004');
  sockSubFiltroOn();
  
  console.log('Servidor escuchando puerto 3002');
});
