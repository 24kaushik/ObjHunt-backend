import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const rooms = [];
const OBJECTS = ["bottle", "remote", "cell phone"];

//Filling up rooms array with empty rooms. (looking for a better approach).
for (let i = 0; i < process.env.MAX_ROOMS; i++) {
  rooms.push({
    id: i,
    players: [],
    current_obj: "",
    isPlaying: false,
    round: 0,
  });
}

//Function to return an empty room id
function assignNewRoom() {
  let availableRooms = rooms.filter((room) => room.players.length === 0);
  if (availableRooms.length === 0) {
    return undefined;
  } else {
    return availableRooms[0].id;
  }
}

//Function to return a room id (doesn't need to be empty, but can't be full)
function assignRoom() {
  let availableRooms = rooms.filter(
    (room) => room.players.length < process.env.MAX_PLAYERS
  );
  if (availableRooms.length === 0) {
    return undefined;
  } else {
    return availableRooms[0].id;
  }
}

//Function to add a user to a room
function addPlayer(user, socketId, roomId) {
  //Finding the room
  for (let room = 0; room < rooms.length; room++) {
    if (rooms[room].id == roomId) {
      // Loop to check if player is duplicate
      for (let i = 0; i < rooms[room].players.length; i++) {
        if (rooms[room].players[i].id === socketId) {
          return 0;
        }
      }
      const player = {
        id: socketId,
        username: user,
        points: 0,
        hasSubmitted: false,
        isCorrect: false,
      };
      rooms[room].players.push(player);
      break;
    }
  }
}

//Function to remove player from a room
function removePlayer(socketId, roomId) {
  //Loop to find the room
  for (let room = 0; room < rooms.length; room++) {
    if (rooms[room].id == roomId) {
      const index = rooms[room].players.findIndex(
        (player) => player.id === socketId
      );
      if (index != -1) {
        rooms[room].players.splice(index, 1);
      }
      break;
    }
  }
}

//Function to generate leaderboard
function generateLeaderboard(roomId) {
  const room = rooms.find((room) => room.id == roomId);
  if (!room) {
    return [];
  }

  const leaderboard = room.players.map((player) => ({
    username: player.username,
    points: player.points,
  }));

  // Sort leaderboard by points in descending order
  leaderboard.sort((a, b) => b.points - a.points);

  return leaderboard;
}

//Function to get a room's details
function GetRoomDetails(roomId) {
  const room = rooms.find((room) => room.id == roomId);
  if (!room) return 0;
  return room;
}

/*
 * Function to assign points to a user
 *
 * expects to get these as arguments:
 *** room's id.
 *** user's id.
 *** an array of players who has already submitted (and their image is correct).
 *** if the image is correct or not.
 *
 * This function assigns (process.env.MAX_PLAYERS) points to user if he's the first one to submit else decrease 1 point for every user that has already submitted (and their image is correct)
 */
const assignPoints = (roomId, userId, playersArray, isCorrectObject) => {
  const room = rooms.findIndex((room) => room.id === roomId);
  if (room === -1) {
    return 0;
  }
  const playerInd = rooms[room].players.findIndex(
    (player) => player.id === userId
  );
  if (playerInd === -1) {
    return 0;
  }
  if (!isCorrectObject) {
    return 1;
  }
  const point = process.env.MAX_PLAYERS - playersArray.length;
  rooms[room].players[playerInd].points += point;
  rooms[room].players[playerInd].isCorrect = true;

  return 1;
};

//Function to set user's hasSubmitted flag to true
function updateSubmitted(userId, roomId) {
  const room = rooms.findIndex((room) => room.id === roomId);
  if (room === -1) {
    return 0;
  }
  const playerInd = rooms[room].players.findIndex(
    (player) => player.id === userId
  );
  if (playerInd === -1) {
    return 0;
  }
  rooms[room].players[playerInd].hasSubmitted = true;
}

// Function to set room's playing status to the provided value (true || false)
function setPlaying(roomId, val) {
  for (let ind = 0; ind < rooms.length; ind++) {
    const room = rooms[ind];
    if (room.id === roomId) {
      rooms[ind].isPlaying = val;
      break;
    }
  }
}

//Function to set the round number of a room
function setRound(roomId, round) {
  for (let ind = 0; ind < rooms.length; ind++) {
    const room = rooms[ind];
    if (room.id === roomId) {
      rooms[ind].round = round;
      break;
    }
  }
}

//Function to reset stats (hasSubmitted, isCorrect) of all players in a room
function resetStats(roomId) {
  for (let ind = 0; ind < rooms.length; ind++) {
    const room = rooms[ind];
    if (room.id === roomId) {
      for (let playerInd = 0; playerInd < room.players.length; playerInd++) {
        rooms[ind].players[playerInd].hasSubmitted = false;
        rooms[ind].players[playerInd].isCorrect = false;
      }
      break;
    }
  }
}

//Function to select a random object and also update room's current_obj property
function generateObject(roomId) {
  const roomInd = rooms.findIndex((room) => room.id == roomId);
  if (roomInd === -1) {
    return 0;
  }
  const randomObj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
  rooms[roomInd].current_obj = randomObj;
  return randomObj;
}

function resetPoints(roomId) {
  for (let ind = 0; ind < rooms.length; ind++) {
    const room = rooms[ind];
    if (room.id === roomId) {
      for (let playerInd = 0; playerInd < room.players.length; playerInd++) {
        rooms[ind].players[playerInd].points = 0;
      }
      break;
    }
  }
}

export {
  rooms,
  assignNewRoom,
  assignRoom,
  addPlayer,
  removePlayer,
  generateLeaderboard,
  GetRoomDetails,
  assignPoints,
  updateSubmitted,
  setPlaying,
  setRound,
  resetStats,
  generateObject,
  resetPoints,
};
