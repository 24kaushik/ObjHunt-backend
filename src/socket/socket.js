import { Server } from "socket.io";
import { addPlayer, assignNewRoom, assignRoom, removePlayer, rooms } from "../utils/roomManager.js";

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      allowedHeaders: ["*"],
    },
  });
  

  io.on("connection", (socket) => {
    console.log(`${socket.id} is here`);
    let user;
    let room;
    socket.on("createRoom", ({ username }) => {
      console.log("creating room");
      if (!username) {
        console.log("no username/id");
        io.to(socket.id).emit(
          "message",
          "Please send username"
        );
      } else {
        user = username;
        console.log("user is here", user);
        let room = assignNewRoom();
        console.log(room, "room");
        if (room !== undefined) {
          console.log("room assigned");
          socket.join(room);
          addPlayer(user, room);
          io.to(room).emit("newplayer", `${user} joined the room!`);
        }
      }
    });

    socket.on("joinRandom", ({ username }) => {
      console.log("joining random room");
      if (!username) {
        console.log("no username/id");
        io.to(socket.id).emit(
          "message",
          "Please send username"
        );
      } else {
        user = username;
        console.log("user is here", user);
        room = assignRoom();
        console.log(room, "room");
        if (room !== undefined) {
          console.log("room assigned");
          socket.join(room);
          addPlayer(user, room);
          io.to(room).emit("newplayer", `${user} joined the room!`);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`${socket.id} is gone`);
      if (room !== undefined) {
        removePlayer(user, room);
        io.to(room).emit("message", `${user} left the room`)
      }
    });
  });
}
