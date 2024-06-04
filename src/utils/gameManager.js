import {
  generateObject,
  resetStats,
  rooms,
  setPlaying,
  setRound,
  resetPoints
} from "./roomManager.js";
//Function to start the game
const startGame = (roomId, io) => {
  //Finding the current room
  const room = rooms.find((room) => room.id === roomId);

  //If room doesnt exist, already playing status, player less than 2, rounds aready exhausted; return 0
  if (
    !room ||
    room.isPlaying ||
    room.players.length < 2 ||
    room.round >= process.send.ROUNDS
  ) {
    return 0;
  }

  //Recursive function to keep the rounds running
  const a = () => {
    //Storing latest room object
    const nroom = rooms.find((room) => room.id === roomId);

    //If the number of rounds is equal to max round, end the match
    if (nroom.round >= process.env.ROUNDS) {
      console.log("matchend");

      setRound(roomId, 0); //Reset rounds
      resetStats(roomId); //Reset flags of players(not points)
      io.to(roomId).emit("game", { msg: "Match ended" });
      io.to(roomId).emit("game", "SYSTEM: Starting new match in 10 seconds");
      setTimeout(() => {
        resetPoints(roomId);
        startGame(roomId, io);
      }, 10000);
    } else {
      //Starting round after 5 seconds
      setTimeout(() => {
        //generating a random object
        const randomObj = generateObject(room.id);

        setPlaying(roomId, true); //set the isPlaying flag of room to true
        setRound(roomId, nroom.round + 1); //Update round number
        resetStats(roomId); //Reset player flags(not points)

        //Ending the round after ROUND_TIME (env variable) milisecs
        setTimeout(() => {
          setPlaying(roomId, false); // setting playing status to false
          io.to(roomId).emit("game", { msg: "round ended" });
          //Calling this function again
          a();
        }, process.env.ROUND_TIME);

        io.to(roomId).emit("game", {
          msg: "round started",
          object: room.current_obj,
          round: room.round,
        });
      }, 5000);
      console.log("current_obj", room.current_obj);
      io.to(roomId).emit("game", { msg: "starting game in 5sec" });
    }
  };

  a();
};

export { startGame };
