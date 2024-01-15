import React from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  // Get the window width outside the JSX expression
  const windowWidth = window.innerWidth;
  {
    console.log(windowWidth);
  }
  const handleplay = () => {
    navigate("/room");
  };
  return (
    <>
      {windowWidth <= 1000 ? (
        <>
          <div className="mobile">
            Unfortunately, version 1.0 of Chessable doesn't support mobile
            phone. Please Access Chessable through Desktop.
          </div>
        </>
      ) : (
        <>
          <div className="homebox">
            <div className="home"></div>
            <button onClick={handleplay} className="btn btn-two">
              Play
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Home;
