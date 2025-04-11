import React from "react";
import Header from '../components_tailwind/Header';
import ReportBtns from "../components_tailwind/ReportBtns";
import Cookies from "js-cookie";

const ReportsEmpty = () => {
  return (
    <div>
      <Header />
      <ReportBtns />
      {Cookies.get("userRole") != "qs_site" && (
        <p className="pt-[15vh] text-[#313131] font-semibold text-[20px] text-center">
          Click on any report to view the details
        </p>
      )}
      {Cookies.get("userRole") == "qs_site" && (
        <p className="pt-[15vh] text-[#313131] font-semibold text-[20px] text-center">
          No reports available
        </p>
      )}
    </div>
  );
};

export default ReportsEmpty;
