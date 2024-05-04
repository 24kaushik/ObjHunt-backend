const rooms = [];
const MAX_ROOMS = 10;
const MAX_PLAYERS = 3;

for (let i = 0; i < MAX_ROOMS; i++) {
  rooms.push({
    id: i,
    name: `Room ${i}`, // Added room name
    players: [],
    teams: [], // Added teams array
    current_obj: "",
  });
}
function assignNewRoom(roomName) {
  console.log(rooms);
  let availableRooms = rooms.filter((val, ind) => val.players.length === 0);
  if (availableRooms.length === 0) {
    return undefined;
  } else {
    const room = availableRooms[0];
    room.name = roomName || `Room ${room.id}`;
    return room.id;
  }
}

function assignRoom() {
  console.log(rooms);
  let availableRooms = rooms.filter(
    (val, ind) => val.players.length < MAX_PLAYERS
  );
  if (availableRooms.length === 0) {
    return undefined;
  } else {
    return availableRooms[0].id;
  }
}

function addPlayer(username, roomId, points = 0) {
  for (let room = 0; room < rooms.length; room++) {
    if (rooms[room].id == roomId) {
      rooms[room].players.push({ username, points }); // Include points for the player
      console.log(rooms[room]);
      break;
    }
  }
}

function removePlayer(username, roomId) {
  for (let room = 0; room < rooms.length; room++) {
    if (rooms[room].id == roomId) {
      const index = rooms[room].players.findIndex(
        (player) => player === username
      );
      if (index !== -1) {
        rooms[room].players.splice(index, 1); // Remove the player from the players array of the room
        console.log(rooms[room]); // Log the updated room object
      }
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

// Example usage:
// generateLeaderboard(0);

export { rooms, assignNewRoom, assignRoom, addPlayer, removePlayer,sendLeaderboardToServer ,generateLeaderboards };
