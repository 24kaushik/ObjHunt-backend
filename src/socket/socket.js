//Importing packages
import { Server } from "socket.io";
import {
  rooms,
  assignNewRoom,
  assignRoom,
  addPlayer,
  removePlayer,
  assignPoints,
  generateLeaderboard,
  GetRoomDetails,
  updateSubmitted,
} from "../utils/roomManager.js";

//Importing functions
import { checkImage } from "../utils/imageManager.js";
import { startGame } from "../utils/gameManager.js";

//Exporting Socket Server
export function initializeSocket(httpServer) {
  //Setting up Socket Server
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      allowedHeaders: ["*"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`${socket.id} is here`);
    //Initialising user(user's username) and room(room's id)
    let user;
    let room;

    //Handling room creation
    socket.on("createRoom", ({ username }) => {
      //If there's no username, emitting an error event to user
      if (!username) {
        io.to(socket.id).emit("error", "Please send username");
      } else {
        user = username;
        room = assignNewRoom(); //Assigning new room to the user

        //If room is successfully assigned, joining the user in that room
        if (room !== undefined) {
          socket.join(room); // Joining user to room's socket channel

          //Adding the user in that room
          let addedPlayer = addPlayer(user, socket.id, room);

          if (addedPlayer === 0) {
            //If user is already in the room, emmiting an error
            io.to(socket.id).emit("error", `You've already joined the room!`);
          } else {
            //Emittimg to the room that a new player has joined and updating the leaderboard
            io.to(room).emit("newplayer", `${user} joined the room!`);
            io.to(room).emit("leaderboard", generateLeaderboard(room));
          }
        }
      }
    });

    //Handling chat messages
    socket.on("message", (msg) => {
      //If there is no username or room id, emmiting an error. Else sending message to that particular room.
      if (room === undefined || user === undefined) {
        io.to(socket.id).emit("error", "no username or user didnt join a room");
      } else {
        io.to(room).emit("message", user + ": " + msg);
      }
    });

    //Handling joining random rooms
    socket.on("joinRandom", ({ username }) => {
      if (!username) {
        //If no username, emmiting error.
        io.to(socket.id).emit("error", "Please send username");
      } else {
        //Storing username and assigning a room
        user = username;
        room = assignRoom();

        //Checking if a room is assigned successfully
        if (room !== undefined) {
          socket.join(room); //Joining user to socket channel

          //Adding player to assigned
          const addedPlayer = addPlayer(user, socket.id, room);
          room;

          //Checking if the user already joined the room
          if (addedPlayer === 0) {
            io.to(socket.id).emit("error", `You've already joined the room!`);
          } else {
            io.to(room).emit("newplayer", `${user} joined the room!`);

            //Starting the game (only if there are 2 or more players. read function declaration for more info)
            startGame(room, io);
            //Emitting new leaderboard to the room
            io.to(room).emit("leaderboard", generateLeaderboard(room));
          }
        }
      }
    });

    socket.on("joinById", async (data) => {
      let { username, roomId } = await JSON.parse(data);
      if (!username) {
        // If no username, emitting error.
        io.to(socket.id).emit("error", "Please send username");
      } else if (!roomId) {
        // If no room ID, emitting error.
        io.to(socket.id).emit("error", "Please send room ID");
      } else {
        // Storing username and roomId
        user = username;
        room = roomId;

        // Checking if the room exists
        if (room !== undefined) {
          socket.join(room); // Joining user to socket channel

          // Adding player to the specified room
          const addedPlayer = addPlayer(user, socket.id, room);

          // Checking if the user already joined the room
          if (addedPlayer === 0) {
            io.to(socket.id).emit("error", `You've already joined the room!`);
          } else {
            io.to(room).emit("newplayer", `${user} joined the room!`);

            // Starting the game (only if there are 2 or more players. read function declaration for more info)
            startGame(room, io);

            // Emitting new leaderboard to the room
            io.to(room).emit("leaderboard", generateLeaderboard(room));
          }
        } else {
          io.to(socket.id).emit("error", "Invalid room ID");
        }
      }
    });

    //TODO: THIS WHOLE THING COULDVE BEEN DONE IN A ROUTE INSTEAD. (sorry for caps lol, just wanted your attention UwU).
    //
    // //Handling mannual leaderboard request
    // socket.on("requestLeaderboard", (roomId) => {
    //   // console.log(`${socket.id} requested leaderboard for room ${roomId}`);
    //   const room = rooms.find((r) => r.id === roomId);
    //   if (!room) {
    //     io.to(socket.id).emit("message", `Room ${roomId} not found`);
    //     return;
    //   }
    //   // Example usage of modifyPoints function
    //   const leaderboard = generateLeaderboard(roomId);
    //   io.to(room).emit("leaderboard", leaderboard);
    // });

    //Handling image uploads
    socket.on("upload", async (data) => {
      //Checking if data is being recieved in correct format and also checking if user and room exists
      if (
        typeof data !== "object" ||
        !(data.hasOwnProperty("image")) ||
        !user ||
        room === undefined ||
        !data.image
      ) {
        //Emitting error if data is in wrong format or user and room isnt defined.
        io.to(socket.id).emit("error", "Data recieved in wrong format.");
      } else {
        //Getting the current room
        const currentRoom = GetRoomDetails(room);

        //Checking if the user is in that game
        const currentPlayer = currentRoom.players.find(
          (player) => player.id === socket.id
        );
        if (!currentPlayer) {
          //If user is not in the game, emitting error
          io.to(socket.id).emit("error", "user not found");
        } else {
          if (currentPlayer.hasSubmitted) {
            //If the user has already submitted image, emitting an error
            io.to(socket.id).emit("error", "Already submitted");
          } else {
            //Extracting base64 data from image and creating a buffer from it and generating a unique filename
            const base64Data = data.image.replace(
              /^data:image\/\w+;base64,/,
              ""
            );
            const buffer = Buffer.from(base64Data, "base64");

            //Checking if image matches the object
            const isCorrectObject = await checkImage(buffer, room);

            console.log(isCorrectObject);

            //Assigning points to user if image is correct
            const playersSubmitted = currentRoom.players.filter(
              (e) => e.isCorrect
            );
            const pointsAssigned = assignPoints(
              room,
              socket.id,
              playersSubmitted,
              isCorrectObject
            );
            //Emitting an error if points are not assigned for some reason
            if (!pointsAssigned) {
              io.to(socket.id).emit("error", "Points not assigned");
            }

            //Updating the hasSubmitted flag of user
            updateSubmitted(socket.id, room);
            //Sending the updated leaderboard
            io.to(room).emit("leaderboard", generateLeaderboard(room));
          }
        }
      }
    });

    //Handling disconnect
    socket.on("disconnect", () => {
      console.log(`${socket.id} is gone`);

      //If player was in a room, removing it from the room
      if (room !== undefined) {
        removePlayer(socket.id, room);
        startGame(room); //starting room if platers are still more than 2
        io.to(room).emit("message", `${user} left the room`);
        io.to(room).emit("leaderboard", generateLeaderboard(room));
      }
    });
  });
}
