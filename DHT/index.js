const zmq = require("zeromq");

const sock = new zmq.Reply

const main =  async () => {
  console.log('Servidor DHT escuchando puerto 8002');
  try {
    await sock.bind("tcp://127.0.0.1:8002");
    for await (const [msg] of sock) {
      const data = JSON.parse(msg.toString())
      let b = Buffer.from(data.data);
      let s = b.toString('utf-8');
      let o = JSON.parse(s);
      console.log(o) 
      const sendInfo = Buffer.from(JSON.stringify("Buenas llega a DHT"))
      await sock.send(sendInfo)
    }
  } catch (err) {
    sock.send("No inserta la infomación")
    console.log(err);
  }
};
main();
