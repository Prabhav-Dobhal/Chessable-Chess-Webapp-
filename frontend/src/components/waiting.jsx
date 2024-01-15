import React, { useState, useEffect } from "react";
import "./waiting.css";

const Waiting = () => {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    // Use setInterval to update dots every 500 milliseconds
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots >= 4 ? 1 : prevDots + 1));
    }, 500);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="waiting_img">
      <div className="waitingtextbox">
        <p>
          Waiting for your opponent to join
          {Array(dots)
            .fill(" .")
            .join("")}
        </p>
      </div>
    </div>
  );
};

export default Waiting;
