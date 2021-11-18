const express = require('express');
const Oferta = require('../Common/Oferta.js');
const Aspirante = require('../Common/Aspirante.js');

let ofertas = [];
let aspirantes = [];

// Comunicación entre Empleador
const zmq = require('zeromq');
const sockPubEmpleador = new zmq.Publisher();
const sockSubEmpleador = new zmq.Subscriber();

//Comunnicación entre Aspirante
const sockPubAspirante = new zmq.Publisher();
const sockSubAspirante = new zmq.Subscriber();

// Comunicación entre DHT
const sockDHT = new zmq.Request();

// Comunicación entre Backup
const sockBackup = new zmq.Reply();

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
      verificarOfertas();
      console.log(resultParse);
    } catch (error) {
      console.log(error);
    }
  }
}

async function enviarMensajeEmpleador(msg) {
  const buf = Buffer.from(JSON.stringify(msg));
  await sockPubEmpleador.send(['Respuesta', buf]);
}

async function sockSubAspiranteOn() {
  try{
    for await (const [topic, msg] of sockSubAspirante) {
      console.log('Topic: ', String(topic), '\n', 'Message: ', JSON.parse(msg));
      let aspirante = Aspirante.fromJSON(msg);
      aspirantes.push(aspirante);
      verificarOfertas();
      console.log(aspirantes);
    }
  }catch(e){
    console.log(e);
  }
}

async function enviarMensajeAspirante(msg) {
  const buf = Buffer.from(JSON.stringify(msg));
  await sockPubAspirante.send(['Respuesta', buf]);
}

async function verificarOfertas(){
  try {
    await sockDHT.send("Buscar");
    const [result] = await sockDHT.receive();
    const data = JSON.parse(result);
    //console.log(data);
    console.log(Object.values(data));
    let ofertasDHT = Object.values(data);
    ofertasDHT.map(oferta =>{
      let ofertaJSON = JSON.parse(oferta);
      aspirantes.forEach(aspirante => {
        if(aspirante.sector.includes(ofertaJSON.sector)){
          enviarMensajeAspirante(ofertaJSON);
          enviarMensajeEmpleador(aspirante);
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
  
}

async function backUp() {
  console.log('Servidor Filtro escuchando puerto 8006');
  try {
    await sockBackup.bind('tcp://192.168.239.129:8006');
    console.log('Servidor Backup escuchando puerto 8006');
    for await (const [msg] of sockBackup) {
      console.log('Backup: ', msg.toString());
      let info = {
        ofertas: ofertas,
        aspirantes: aspirantes
      }
      const sendInfo = Buffer.from(JSON.stringify(info));
      await sockBackup.send(sendInfo);
    }
  } catch (err) {
    console.log(err, 'Error');
    sockBackup.send('error');
    console.log(err);
  }
}

servidor.listen(8001, async () => {
  sockSubEmpleador.connect('tcp://192.168.239.130:8003');
  sockSubEmpleador.subscribe('Ofertas');
  sockSubEmpleadorOn();
  console.log('Subscriber Empleador connected to port 8003');

  await sockPubEmpleador.bind('tcp://192.168.239.130:8002');
  console.log('Publisher Empleador to sport 80002');

  sockSubAspirante.connect('tcp://192.168.239.130:8003');
  sockSubAspirante.subscribe('Aspirante');
  sockSubAspiranteOn();
  console.log('Subscriber Aspirante connected to port 8003');

  await sockPubAspirante.bind('tcp://192.168.239.130:8004');
  console.log('Publisher Empleador to sport 80004');

  sockDHT.connect('tcp://192.168.239.130:8005');
  console.log('SeverDHT bound to port 8005');

  backUp();

  console.log('Servidor Filtro escuchando puerto 8001');
});
