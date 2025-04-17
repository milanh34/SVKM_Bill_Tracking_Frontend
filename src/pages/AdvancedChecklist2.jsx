import { useState } from "react";
import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import print from "../assets/print.svg";
import logo from "../assets/logo.png";

const ITEMS_PER_PAGE = 1;

const AdvancedChecklist = (props) => {
  const location = useLocation();
  const billList = location.state?.selectedRows || [];
  const billsData = location.state?.bills || [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  console.log("Bills Data:", billsData);

  const handlePrint = () => {
    window.print();
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = billsData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      <Header />

      <div className="flex items-center justify-between px-20 mt-5">
        <button
          className="btn print"
          onClick={handlePrint}
          style={{
            width: "fit-content",
            padding: "1vh 2vw",
            display: "flex",
            alignItems: "center",
            background: "#208AF0",
            marginLeft: "auto",
            gap: "10px",
          }}
        >
          Print All Advanced Checklist <img src={print} alt="Print Icon" />
        </button>
      </div>

      <main className="flex-grow p-4">
        {currentItems.map((item, index) => (
          <div key={index}>
            <div className="w-full max-w-[90%] mx-auto">
              <div className="border border-gray-300 bg-white font-semibold">
                <div className="grid grid-cols-3 bg-gray-200 items-center">
                  <div className="p-2 border-b border-gray-300 flex items-center">
                    <div className="text-sm font-semibold">
                      <img src={logo} alt="" className="h-10" />
                    </div>
                  </div>
                  <div className="border-gray-300">
                    <div className="text-sm text-center">{item?.srNo}</div>
                  </div>
                  <div>Check List For - Advance/LC/BG</div>
                </div>
                <div className="p-2 border-b border-gray-300 bg-gray-200">
                  Project Incharge -
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-black p-4">1</td>
                      <td className="border border-black p-4">
                        SAP Code & Vendor Name
                      </td>
                      <td className="border border-black p-4">
                        {item?.sapCode} {item?.vendorName}
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">2</td>
                      <td className="border border-black p-4">
                        Nature of advance
                      </td>
                      <td className="border border-black p-4">
                        <div className="space-y-2">
                          <div>
                            Recoverable mobilisation/Non recoverable
                            mobilisation/Ad hoc advance: {item?.recoverable}
                          </div>
                          <div>
                            If mobilisation,QS certification attached:{" "}
                            {item?.qsCertification}
                          </div>
                          <div>
                            If against BG,date of expiry: {item?.bgDate}
                          </div>
                        </div>
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">3</td>
                      <td className="border border-black p-4">
                        If advance on behalf of Contractor
                      </td>
                      <td className="border border-black p-4">
                        {item?.isContractor === "Yes"
                          ? `Yes, Name of Contractor: ${item?.contractorName}`
                          : "No"}
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">4</td>
                      <td className="border border-black p-4">
                        Project Name & Region
                      </td>
                      <td className="border border-black p-4">
                        {item?.projectName}, {item?.region}
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">5</td>
                      <td className="border border-black p-4">
                        PO No and Date and Amount
                      </td>
                      <td className="border border-black p-4">
                        {item?.poNumber &&
                          `PO: ${item?.poNumber}, Date: ${item?.poDate}, Amount: ${item?.poAmount}`}
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">6</td>
                      <td className="border border-black p-4">
                        If PO not raised, reason
                      </td>
                      <td className="border border-black p-4">
                        {item?.isPORaised === "No"
                          ? item?.poReason
                          : "PO Raised"}
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">7</td>
                      <td className="border border-black p-4">
                        GST No of Vendor
                      </td>
                      <td className="border border-black p-4">{item?.gstNo}</td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">8</td>
                      <td className="border border-black p-4">
                        Payment is towards
                      </td>
                      <td className="border border-black p-4">
                        Material/Services/Material + Services/Work
                        Contract/Cement/Steel
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">9</td>
                      <td className="border border-black p-4">PAN Status</td>
                      <td className="border border-black p-4">
                        {item?.panStatus}
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">10</td>
                      <td className="border border-black p-4">
                        Compliance u/s 206 AB
                      </td>
                      <td className="border border-black p-4">
                        {item?.compliance}
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-4">11</td>
                      <td className="border border-black p-4">Amount INR</td>
                      <td className="border border-black p-4">
                        {item?.amountINR}
                      </td>
                      <td className="border border-black p-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6 mb-6">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="btn px-4 py-2 bg-[#0047ab] rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="btn px-4 py-2 bg-[#0047ab] rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </>
  );
};

export default AdvancedChecklist;
