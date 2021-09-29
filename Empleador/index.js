const express = require('express');

const zmq = require('zeromq');
const sock = new zmq.Publisher();

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

servidor.post('/', async (req, res, next) => {
  console.log(req.body);
  try {
    const buf = Buffer.from(JSON.stringify(req.body));
    await sock.send(['Empleos45', buf]);
    res.status(201).json({ data: 'Se envio el empleo' });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

servidor.listen(3000, async () => {
  await sock.bind('tcp://127.0.0.1:8001');
  console.log('Publisher bound to sport 8001');
  console.log('Servidor escuchando puerto 3000');
});
