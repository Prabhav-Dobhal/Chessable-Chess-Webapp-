import React from "react";
import "./select_board.css";
import { useNavigate, useParams } from "react-router-dom";
const SelectBoard = () => {
  const { room, color } = useParams();
  const navigate = useNavigate();
  const gotocheeerful = () => {
    navigate(`/play/${room}/c/${color}`);
  };
  const gotoserious = () => {
    navigate(`/play/${room}/s/${color}`);
  };
  return (
    <>
      <div className="select_screen">
        <div className="box-2">
          <button className="btn btn-two" onClick={gotocheeerful}>
            <span>Cheerful</span>
          </button>
          <button className="btn btn-two" onClick={gotoserious}>
            <span>Serious</span>
          </button>
        </div>
      </div>
    </>
  );
};
export default SelectBoard;
