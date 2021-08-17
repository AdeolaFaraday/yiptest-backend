const app = require("express")();
const httpServer = require("http").createServer(app);
const PORT = process.env.PORT || 8000;

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.send("working as intended");
});

let users = [];

const addUser = (name, location, socket) => {
  const user = users.find((user) => user.name === name);
  console.log(user);
  if (user === undefined && name !== undefined) {
    users.push({ name, location, socketId: socket });
  }
  return users;
};

const removeUser = (socket) => {
  users = users.filter((user) => user.socketId !== socket);
  return users;
};

io.on("connection", (socket) => {
  //when connect
  console.log("a user connected");
  socket.on("addUser", ({ location, name }, callback) => {
    const users = addUser(name, location, socket.id);
    console.log(users, 'adduser');
    io.emit("onlineUsers", { onlineUsers: users });
  });

  socket.on("getUsers", () => {
    io.emit("onlineUsers", { onlineUsers: users });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    const onlineUsers = removeUser(socket.id);
    io.emit("onlineUsers", { onlineUsers: onlineUsers });
    // io.emit("getPlayers", players);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
