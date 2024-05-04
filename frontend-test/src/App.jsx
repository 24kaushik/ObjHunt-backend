import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { connect, io } from "socket.io-client";

function App() {
  const [message, setMessage] = useState([]);
  const [user, setUser] = useState("");
  const socket = useMemo(() => io("http://localhost:6969"), []);

  function handleClick(e) {
    e.preventDefault();
    socket.emit("createRoom", { username: user });
    setUser("");
  }

  useEffect(() => {
    socket.on("newplayer", (e) => {
      console.log(e);
      setMessage((prevMessage) => [...prevMessage, e]);
    });
    socket.on("message", (e) => {
      console.log(e);
      setMessage((prevMessage) => [...prevMessage, e]);
    });
    socket.on("userLeft", (e) => { // Listen for userLeft event
      console.log(e);
      setMessage((prevMessage) => [...prevMessage, e]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function handleChange(e) {
    e.preventDefault();
    setUser(e.target.value);
    console.log(user);
  }
  function handleLeave(e) {
    e.preventDefault();
    socket.emit("leaveRoom", { username: user, roomId: 0 });
    
  }

  function handleRandom(e) {
    e.preventDefault();
    socket.emit("joinRandom", { username: user });

  }

  return (
    <>
      <input
        type="text"
        name=""
        placeholder="username"
        onChange={handleChange}
        value={user}
        id=""
      />
      <button onClick={handleRandom}>Join Random</button>
      <button onClick={handleClick}>Create Room</button>
      <button onClick={handleLeave}>Leave Room </button>
      <div>
        {message.map((e, index) => (
          <h6 key={index}>{e}</h6> // Use index as key and remove id="e" to avoid duplicates
        ))}
      </div>
    </>
  );
}

export default App;
