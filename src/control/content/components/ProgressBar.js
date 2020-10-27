import React from "react";

const ProgressBar = (props) => {
  const { bgcolor, completed } = props;

  let containerStyles = completed
    ? {
        height: 30,
        width: "80%",
        backgroundColor: "#e0e0de",
        borderRadius: 50,
        margin: 50,
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
