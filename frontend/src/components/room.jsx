import React, { useEffect } from "react";
import { useState } from "react";
import "./room.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Room = () => {
  const navigate = useNavigate();
  const [joinroomopen, setjoinroomopen] = useState(false);
  const [room, setroom] = useState("");
  const [recievedroom, setrecievedroom] = useState("");
  const [showroomid, setshowroomid] = useState(false);
  const handle_createroom = async () => {
    try {
      const response = await axios.post(
        "https://chessable-backend-u08b.onrender.com/create_room"
      );
      console.log(response);
      setrecievedroom(response.data.room);
      setjoinroomopen(true);
    } catch (e) {
      console.error(e);
    }
  };
  const handle_joinroom = async () => {
    setjoinroomopen(true);
  };
  const handlechange = (e) => {
    setroom(e.target.value);
  };
  useEffect(() => {
    if (recievedroom !== "") {
      setshowroomid(true);
    }
  }, [recievedroom]);
  const joinroom = async () => {
    console.log(room);
    try {
      const response = await axios.post(
        "https://chessable-backend-u08b.onrender.com/validate",
        {
          room,
        }
      );
      console.log(response);
      if (response.data.status === true) {
        navigate(`/select_board/${room}/b`);
      }
    } catch (e) {
      console.error("join room request error!");
    }
  };
  const handlecontinue = () => {
    navigate(`/select_board/${recievedroom}/w`);
  };
  return (
    <>
      <div className="roombox">
        {joinroomopen === false ? (
          <>
            <button className="roombtn createroom" onClick={handle_createroom}>
              Create Room
            </button>
            <button className="roombtn joinroom" onClick={handle_joinroom}>
              Join Room
            </button>
          </>
        ) : !showroomid ? (
          <>
            <div className="inputbox">
              <div className="inputtext">Please paste the join code below</div>
              <input
                type="text"
                onChange={handlechange}
                className="inputarea"
              />
              <button className="roombtn joinroom" onClick={joinroom}>
                Join Now !
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="createopen">
              <div className="roomid">Your room id is</div>
              <div className="room">{`${recievedroom}`}</div>
              <p>Copy and share it with your friend to play with.</p>
              <button className="roombtn continue" onClick={handlecontinue}>
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default Room;
