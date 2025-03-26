import React from "react";
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import ReportBtns from "../components/ReportBtns";
import Cookies from "js-cookie";

const ReportsEmpty = () => {
  return (
    <div>
      <Header />
      <ReportBtns />
      {Cookies.get("userRole") != "qs_site" && (
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
      {Cookies.get("userRole") == "qs_site" && (
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
