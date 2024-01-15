import React, { useEffect, useRef } from "react";
import "./play.css";
import { useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useParams } from "react-router-dom";
import { Chess } from "chess.js";
import socket from "./socket";
import Waiting from "./waiting";
const chess = new Chess();
const Piece = ({ type, rowIndex, colIndex, handleDrop }) => {
  const previewRef = useRef(null);

  const [, drop] = useDrop({
    accept: "PIECE",
    drop: (item) =>
      handleDrop(item.rowIndex, item.colIndex, rowIndex, colIndex),
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "PIECE",
    item: { type, rowIndex, colIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  useEffect(() => {
    drag(preview(previewRef.current, { captureDraggingState: true }));
    // console.log(previewRef.current);
  }, [drag, preview, { isDragging }]);

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="piece-container"
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grabbing", // Change cursor style when dragging
      }}
    >
      {type !== null && type !== "." ? (
        <img
          ref={previewRef}
          src={`/images/${type}.png`}
          className="piece"
          alt={type + rowIndex * 13 + colIndex * 17}
          style={{
            top: `calc(6vw * ${rowIndex})`,
            left: `calc(5.9vw * ${colIndex} + ${
              colIndex - 4 >= 0
                ? colIndex === 4 || colIndex === 5
                  ? "0.3vw"
                  : "0.7vw"
                : "0vw"
            })`,
            width: "5.9vw",
            // transform: isDragging ? "translate(-20%, -20%)" : "none", // Adjust transform property
          }}
        />
      ) : (
        <div
          className="piece"
          alt={type + rowIndex * 13 + colIndex * 17}
          style={{
            top: `calc(6vw * ${rowIndex})`,
            left: `calc(6vw * ${colIndex})`,
            width: "5.9vw",
            height: "5.9vw",
          }}
        />
      )}
    </div>
  );
};

const Play = () => {
  const [gamestarted, setgamestarted] = useState(false);
  const [roomjoined, setroomjoined] = useState(false);
  const [BTime, setBTime] = useState(600);
  const [WTime, setWTime] = useState(600);
  const [result, setresult] = useState("");
  const { mode, room, color } = useParams();
  useEffect(() => {
    // Connect to the server
    socket.connect();
    // console.log("Socket connection status:", socket.connected);
    // Assuming you want to join a room when the component mounts
    if (roomjoined === false) {
      socket.emit("joinRoom", { room, color }, () => {
        setroomjoined(true);
      });
    }
    socket.on("move", (move) => {
      console.log("move recieved!");
      movemade(move);
    });
    socket.on("updateClock", (time) => {
      // console.log(time);
      if (time.color === "w") setWTime(time.time);
      else setBTime(time.time);
    });
    socket.on("startGame", () => {
      setgamestarted(true);
    });
    socket.on("timeUp", (c) => {
      console.log(c.color);
      if (c.color !== color) setresult("win");
      else setresult("lost");
    });
    // Cleanup function (optional): Disconnect from the room when the component unmounts
    // return () => {
    // socket.emit("leaveRoom", { room, color });
    // Disconnect from the server when the component unmounts
    // socket.disconnect();
    // };
  }, [socket]);
  const sendmove = (move) => {
    console.log("client sned move");
    socket.emit("move", move, room);
  };
  // console.log(mode + " " + color);
  const initialBoardWhite = [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
  ];
  const initialBoardBlack = [
    ["wr", "wn", "wb", "wk", "wq", "wb", "wn", "wr"],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    ["r", "n", "b", "k", "q", "b", "n", "r"],
  ];

  const [chessboard, setChessboard] = useState(
    color === "w" ? initialBoardWhite : initialBoardBlack
  );

  const handleDrop = (startRow, startCol, endRow, endCol) => {
    if (
      chessboard[startRow][startCol] !== null &&
      !(endCol === startCol && endRow === startRow) &&
      (color === "w"
        ? chessboard[startRow][startCol].length === 2
        : chessboard[startRow][startCol].length === 1)
    ) {
      //move
      let move = "";
      //a piece moved
      if (
        chessboard[startRow][startCol] !== "p" &&
        chessboard[startRow][startCol] !== "wp"
      ) {
        if (chessboard[startRow][startCol][0] === "w") {
          move += chessboard[startRow][startCol][1].toUpperCase();
          move += String.fromCharCode(
            "a".charCodeAt(0) + (color === "w" ? startCol : 7 - startCol)
          );
          move += Math.abs((color === "w" ? 9 : 0) - (startRow + 1)).toString();
        } else {
          move += chessboard[startRow][startCol];
          move += String.fromCharCode(
            "a".charCodeAt(0) + (color === "w" ? startCol : 7 - startCol)
          );
          move += Math.abs((color === "w" ? 9 : 0) - (startRow + 1)).toString();
        }
      } else {
        //its a pawn
        move += String.fromCharCode(
          "a".charCodeAt(0) + (color === "w" ? startCol : 7 - startCol)
        );
        move += Math.abs((color === "w" ? 9 : 0) - (startRow + 1)).toString();
      }
      //capture?
      if (chessboard[endRow][endCol] !== null) {
        move +=
          "x" +
          String.fromCharCode(
            "a".charCodeAt(0) + (color === "w" ? endCol : 7 - endCol)
          ) +
          Math.abs((color === "w" ? 9 : 0) - (endRow + 1)).toString();
      } else {
        move += String.fromCharCode(
          "a".charCodeAt(0) + (color === "w" ? endCol : 7 - endCol)
        );
        move += Math.abs((color === "w" ? 9 : 0) - (endRow + 1)).toString();
      }
      //pawn promotion
      if (
        (chessboard[startRow][startCol] === "p" &&
          endRow === (color === "w" ? 7 : 0)) ||
        (chessboard[startRow][startCol] === "wp" &&
          endRow === (color === "w" ? 0 : 7))
      ) {
        move += "=";
        if (chessboard[startRow][startCol] === "p") move += "q";
        else move += "Q";
      }
      console.log(move);
      if (movemade(move)) sendmove(move);
    }
    // console.log("something");
  };
  const movemade = (move) => {
    try {
      chess.move(move);
    } catch (e) {
      console.error(e);
      return false;
    }
    console.log(chess.ascii());
    // let newchessboard = [...chessboard];
    // newchessboard[endRow][endCol] = newchessboard[startRow][startCol];
    // newchessboard[startRow][startCol] = null;
    // console.log(startRow, startCol, endRow, endCol);
    // setChessboard(newchessboard);

    const chessboardAscii = chess.ascii();
    // Split the ASCII representation into rows
    const rows = chessboardAscii
      .trim()
      .split("\n")
      .slice(1, -2); // Trim and remove the first and last 2 rows

    // Create a 2D array to store the elements
    const chessboardArray = rows.map((row) =>
      row
        .trim()
        .split(/\s+/)
        .slice(2, -1)
        .map((piece) => {
          if (/[A-Z]/.test(piece)) {
            return "w" + piece.toLowerCase();
          }
          if (piece === ".") return null;
          return piece;
        })
    );
    if (color === "b") {
      let blackboard = Array.from({ length: 8 }, () => new Array(8));
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          blackboard[i][j] = chessboardArray[7 - i][7 - j];
          // console.log(7 - i + " " + (7 - j));
        }
      }
      setChessboard(blackboard);
    } else {
      console.log(chessboardArray);
      // let newchessboard = chess.ascii();
      // for(let row=1;row<9;row++){
      //   for(let col=2;col<)
      // }
      setChessboard(chessboardArray);
    }
    if (chess.isCheckmate()) {
      console.log(color + "is checkmated");
    }
    if (chess.isDraw()) {
      console.log("game is drawn");
      setresult("draw");
    }
    return true;
  };

  return gamestarted === false ? (
    <Waiting />
  ) : (
    <>
      {result === "" ? (
        <DndProvider backend={HTML5Backend}>
          <div className={mode === "c" ? "playboxc" : "playboxs"}>
            <div className={mode === "c" ? "board_c" : "board_s"}>
              {chessboard.map((rank, rowIndex) => (
                <div key={rowIndex} className="rank">
                  {rank.map((piece, colIndex) => (
                    <Piece
                      key={(colIndex + 1) * 13 + (rowIndex + 1) * 17}
                      type={piece}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      handleDrop={handleDrop}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="clock">
              <div
                className="clock_opp"
                style={{
                  backgroundColor: mode === "c" ? "#e1a2c8" : "#757194",
                }}
              >
                {color === "w" ? `${BTime}` : `${WTime}`}
              </div>
              <div
                className="clock_me"
                style={{
                  backgroundColor: mode === "c" ? "#e1a2c8" : "#757194",
                }}
              >
                {color === "w" ? `${WTime}` : `${BTime}`}
              </div>
            </div>
          </div>
        </DndProvider>
      ) : (
        <>
          <div className={`${result}`}></div>
        </>
      )}
    </>
  );
};

export default Play;
