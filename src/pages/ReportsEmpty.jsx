import React from "react";
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import ReportBtns from "../components/ReportBtns";

const ReportsEmpty = () => {
  return (
    <div>
      <Header />
      <ReportBtns />
      {localStorage.getItem("userRole") != "QS_Team" && (
        <p
          style={{
            paddingTop: "15vh",
            color: "#313131",
            fontWeight: "600",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          Click on any report to view the details
        </p>
      )}
      {localStorage.getItem("userRole") == "QS_Team" && (
        <p
          style={{
            paddingTop: "15vh",
            color: "#313131",
            fontWeight: "600",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          No reports available
        </p>
      )}
    </div>
  );
};

export default ReportsEmpty;
