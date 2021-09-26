const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv/config");
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const Redis = require("ioredis");
const sub = new Redis();
const pub = new Redis();
sub.subscribe("test"); // From now, `sub` enters the subscriber mode.

sub.on("message", (channel, message) => {
  console.log("new message: ", message);
  io.sockets.in("room").emit("new-message", message);
});

io.on("connection", (socket) => {
  // ...
  console.log(`socket client ${socket.id} connected to server`);
  socket.join("room");
  socket.on("send", (msg) => {
    pub.publish("test", `New message from ${socket.id} : ${msg}`);
    // socket.emit("new-message", msg);
  });
});

httpServer.listen(process.env.PORT, () =>
  console.log(`server started on ${process.env.PORT}`)
);
