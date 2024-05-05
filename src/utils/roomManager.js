const rooms = [];
const MAX_ROOMS = 10;
const MAX_PLAYERS = 3;

for (let i = 0; i < MAX_ROOMS; i++) {
  rooms.push({
    id: i,
    players: [],
    current_obj: "",

  });
}

function assignNewRoom() {
  let availableRooms = rooms.filter((val, ind) => val.players.length === 0);
  if (availableRooms.length === 0) {
    return undefined;
  } else {
    return availableRooms[0].id;
  }
}

function assignRoom() {
  let availableRooms = rooms.filter(
    (val, ind) => val.players.length < MAX_PLAYERS
  );
  if (availableRooms.length === 0) {
    return undefined;
  } else {
    return availableRooms[0].id;
  }
}

function addPlayer(user, socketId, roomId) {
  for (let room = 0; room < rooms.length; room++) {
    if (rooms[room].id == roomId) {
      // Loop to check if player is duplicate
      for (let i = 0; i < rooms[room].players.length; i++) {
        if (rooms[room].players[i].id === socketId) {
          console.log("duplicate user");
          return 0;
        }
      }
      const player = {
        id: socketId,
        username: user, // Changed username to user
        points: 0,
      };
      rooms[room].players.push(player);
      console.log(rooms[room]);
      break;
    }
  }
}

function removePlayer(socketId, roomId) {
  for (let room = 0; room < rooms.length; room++) {
    if (rooms[room].id == roomId) {
      const index = rooms[room].players.findIndex(
        (player) => player.id === socketId
      );
      if (index != -1) {
        rooms[room].players.splice(index, 1);
      }
      console.log(rooms);
      break;
    }
  }
}
function generateLeaderboard(roomId) {
  const room = rooms.find((room) => room.id === roomId);
  if (!room) {
    return "Room not found";
  }

  const leaderboard = room.players.map((player) => ({
    username: player.username,
    points: player.points,
  }));

  // Sort leaderboard by points in descending order
  leaderboard.sort((a, b) => b.points - a.points);

  // Send the leaderboard data to the server
  sendLeaderboardToServer(roomId, leaderboard);

  return leaderboard;
}


function sendLeaderboardToServer(roomId, leaderboard) {
  // Simulate sending data to the server
  console.log(`Leaderboard for Room ${roomId} sent to server:`, leaderboard);
}
// Example usage of modifyPoints function

export {
  rooms,
  assignNewRoom,
  assignRoom,
  addPlayer,
  removePlayer,
  // modifyPoints,
  generateLeaderboard,
};
