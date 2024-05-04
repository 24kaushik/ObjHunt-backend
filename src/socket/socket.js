import { Server } from "socket.io";
import {
  addPlayer,
  assignNewRoom,
  assignRoom,
  removePlayer,
  generateLeaderboard,
  sendLeaderboardToServer,
  rooms,
} from "../utils/roomManager.js";

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
        io.to(socket.id).emit("message", "Please send username");
      } else {
        user = username;
        console.log("user is here", user);
        room = assignNewRoom();
        console.log(room, "room");
        if (room !== undefined) {
          console.log("room assigned");
          socket.join(room);
          addPlayer(user, room);
          io.to(room).emit("newplayer", `${user} joined the room!`);
          // Emit leaderboard after a new player joins
          io.to(room).emit("leaderboard", generateLeaderboard(room));
        }
      }
    });

    socket.on("joinRandom", ({ username }) => {
      console.log("joining random room");
      if (!username) {
        console.log("no username/id");
        io.to(socket.id).emit("message", "Please send username");
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
          // Emit leaderboard after a new player joins
          io.to(room).emit("leaderboard", generateLeaderboard(room));
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`${socket.id} is gone`);
      if (user !== "" && room !== undefined) {
        // Check if user is not empty and room is defined
        removePlayer(user, room);
        io.to(room).emit("message", `${user} left the room`);
        // Emit leaderboard after a player leaves
        io.to(room).emit("leaderboard", generateLeaderboard(room));
      }
    });

    socket.on("requestLeaderboard", (roomId) => {
      console.log(`${socket.id} requested leaderboard for room ${roomId}`);
      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        io.to(socket.id).emit("message", `Room ${roomId} not found`);
        return;
      }
      // Example usage of modifyPoints function
      modifyPoints(roomId, {
        "shubhankar": 10, // Add 10 points to player "shubhankar"
        "Rahul": -5, // Deduct 5 points from player "Rahul"
        "Shri": 20, // Add 20 points to player "Shri"
      });
      const leaderboard = generateLeaderboard(roomId);
      io.to(socket.id).emit("leaderboard", leaderboard);
    });
  });
}

function modifyPoints(roomId, pointModifiers) {
  const room = rooms.find((room) => room.id === roomId);
  if (!room) {
    console.log("Room not found");
    return;
  }

  Object.entries(pointModifiers).forEach(([username, modifier]) => {
    const player = room.players.find(
      (player) => player.username.trim() === username.trim()
    );
    if (player) {
      player.points += modifier;
      console.log(`Points modified for player ${username} in Room ${roomId}`);
    } else {
      console.log(`Player ${username} not found in Room ${roomId}`);
    }
  });

  // Log the updated room object
  console.log(room);
}
