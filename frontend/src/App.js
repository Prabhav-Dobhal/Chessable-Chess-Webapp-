import Play from "./components/play";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SelectBoard from "./components/select_board";
import Home from "./components/home";
import Room from "./components/room";
// import socketIO from "socket.io-client";
// import { useEffect, useState } from "react";

function App() {
  // const [socket, setSocket] = useState(null);

  // useEffect(() => {
  //   const socketInstance = socketIO("http://localhost:8000");

  //   // Connect to the server
  //   socketInstance.connect();
  //   console.log(socketInstance.connected);
  //   // Set the socket instance in state
  //   setSocket(socketInstance);
  //   // Cleanup function: Disconnect from the server when the component unmounts
  //   return () => {
  //     socketInstance.disconnect();
  //   };
  // }, []);

  // if (!socket) {
  //   // Return loading or placeholder component until socket is connected
  //   return <div>Loading...</div>;
  // }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:room/:mode/:color/" element={<Play />} />
        <Route path="/select_board/:room/:color" element={<SelectBoard />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
