import React from "react";

const ProgressBar = (props) => {
  const { bgcolor, completed } = props;

  let containerStyles = completed
    ? {
        height: 30,
        width: "90%",
        backgroundColor: "#e0e0de",
        borderRadius: 50,
        marginTop: "50px",
        margiBottom: "50px",
        marginLeft: "5vw",
        marginBottom: "30px",
      }
    : {
        visibility: "hidden",
      };

  const fillerStyles = {
    height: "100%",
    width: `${completed || 0}%`,
    backgroundColor: bgcolor,
    transition: "width 1s ease-in-out",
    borderRadius: "inherit",
    textAlign: "right",
  };

  const labelStyles = {
    padding: 5,
    color: "white",
    fontWeight: "bold",
  };

  return (
    <div id={"progressbar"} style={containerStyles}>
      <div style={fillerStyles}>
        <p style={labelStyles}>{completed}%</p>
      </div>
    </div>
  );
};

export default ProgressBar;
