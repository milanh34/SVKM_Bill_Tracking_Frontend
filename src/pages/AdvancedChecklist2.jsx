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
    const win = window.open("", "_blank");

    const printStyles = `
      <style>
        @media print {
          @page {
            margin: 10mm;
            size: A4;
          }
          body { 
            padding: 5px;
            margin: 10px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .checklist-page {
            width: 100%;
            margin: 0 auto;
            page-break-after: always;
          }
          .checklist-page:last-child {
            page-break-after: avoid;
          }
          .content-row {
            padding: 8px;
            font-size: 0.875rem;
            border-bottom: 1px solid #e5e7eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            border: 1px solid #e5e7eb;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 6px 8px;
            font-size: 0.875rem;
          }
          th {
            background-color: #f3f4f6;
            text-align: left;
          }
          tr:nth-child(even) { background-color: #f9fafb; }
          .logo-img { height: 40px; }
          .grid-row {
            display: grid;
            padding: 8px;
            font-size: 0.875rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .grid-2 {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .grid-3 {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .bold{
            font-weight: bold;
          }
          .lg {
            font-size: 1.125rem;
          }
        }
      </style>
    `;

    win.document.write(`
      <html>
        <head>
          <title>Advanced Checklist</title>
          ${printStyles}
        </head>
        <body>
    `);

    billsData.forEach((item) => {
      const content = `
        <div class="checklist-page">
          <div class="grid-row grid-2">
            <div>
              <img src="${logo}" alt="" class="logo-img" style="height: 40px; vertical-align: middle;" />
              &nbsp;&nbsp;&nbsp;
              ${item?.srNo || ""}
            </div>
            <div>
              Check List For - Advance/LC/BG
            </div>
          </div>
          <div class="bold lg">Project Incharge -</div>
          <table>
            <tbody>
              <tr>
                <td>1</td>
                <td>SAP Code & Vendor Name</td>
                <td>${item?.vendorNo} ${item?.vendorName}</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Nature of advance</td>
                <td>
                  <div>Recoverable mobilisation/Non recoverable mobilisation/Ad hoc advance</div>
                  <div>If mobilisation,QS certification attached - Yes / No</div>
                  <div>If against BG,date of expirty -___________________</div>
                </td>
              </tr>
              <tr>
                <td>3</td>
                <td>If advance on behalf of Contractor</td>
                <td>
                  <div>Yes / No</div>
                  <div>If yes;Name of the Controctor-________________________________________</div>
                </td>
              </tr>
              <tr>
                <td>4</td>
                <td>Project Name & Region</td>
                <td>${item?.projectDescription}, ${item?.region}</td>
              </tr>
              <tr>
                <td>5</td>
                <td>PO No and Date and Amount</td>
                <td>${
                  item?.poNo
                    ? `PO No: ${item?.poNo}, Date: ${formatDate(
                        item?.poDate
                      )}, Amount: ${item?.poAmt}`
                    : ""
                }</td>
              </tr>
              <tr>
                <td>6</td>
                <td>If PO not raised, reason and other details</td>
                <td></td>
              </tr>
              <tr>
                <td>7</td>
                <td>GST No of Vendor</td>
                <td>${item?.gstNumber || ""}</td>
              </tr>
              <tr>
                <td>8</td>
                <td>Payment is towards</td>
                <td>Material / Services / Material + Services/Work Contract/Cement/Steel</td>
              </tr>
              <tr>
                <td>9</td>
                <td>PAN Status</td>
                <td>${item?.panStatus || ""}</td>
              </tr>
              <tr>
                <td>10</td>
                <td>Compliance u/s 206 AB</td>
                <td>${item?.compliance206AB || ""}</td>
              </tr>
              <tr>
                <td>11</td>
                <td>Remarks</td>
                <td>${item?.advancePercentage || ""} - ${
        item?.approvalDetails?.remarksPimoMumbai || ""
      }</td>
              </tr>
              <tr>
                <td>12</td>
                <td>Amount INR</td>
                <td>${item?.currency || ""} ${
        item?.advanceAmt || ""
      } (In words___________________________________)</td>
              </tr>
              <tr>
                <td>13</td>
                <td>Advance request entered by</td>
                <td>${item?.advRequestEnteredBy || ""}</td>
              </tr>
              <tr>
                <td>14</td>
                <td>Addl.Remarks/Queries</td>
                <td></td>
              </tr>
              <tr>
                <td>15</td>
                <td>Approval by Project Incharge & Trustee</td>
                <td></td>
              </tr>
              <tr class="font-medium text-xl">
                <td class="bg-gray-200 p-2 border-l"></td>
                <td class="bg-gray-200 p-2 text-center bold lg">
                  Accounts Department
                </td>
                <td class="bg-gray-200 p-2 border-r text-center bold lg">
                  Date________
                </td>
              </tr>
              <tr>
                <td>16</td>
                <td>TDS deductable u/s 194C/194J @</td>
                <td></td>
              </tr>
              <tr>
                <td>17</td>
                <td>WCT decuctable @</td>
                <td></td>
              </tr>
              <tr>
                <td>18</td>
                <td>Net Amount Payable</td>
                <td></td>
              </tr>
              <tr>
                <td>19</td>
                <td>SAP Payment Doc.No</td>
                <td></td>
              </tr>
              <tr>
                <td>20</td>
                <td>Advance In Vendor Account as on Date</td>
                <td></td>
              </tr>
              <tr>
                <td>21</td>
                <td>Advance In Vendor Account agst above PO</td>
                <td></td>
              </tr>
              <tr>
                <td>22</td>
                <td>Total advance agst above PO after this advance</td>
                <td></td>
              </tr>
              <tr>
                <td>23</td>
                <td>Approval by CFO</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      win.document.write(content);
    });

    win.document.write("</body></html>");
    win.document.close();

    win.onload = () => {
      setTimeout(() => {
        win.document.title = "Advanced Checklist";
        win.focus();
        win.print();
        win.close();
      }, 250);
    };
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
                    <div className="text-xl font-medium">
                      <img src={logo} alt="" className="h-10" />
                    </div>
                  </div>
                  <div className="border-gray-300 font-medium text-xl">
                    <div className="text-center">{item?.srNo}</div>
                  </div>
                  <div className="font-medium text-xl">
                    Check List For - Advance/LC/BG
                  </div>
                </div>
                <div className="p-2 border-b border-gray-300 bg-gray-200 text-xl font-medium">
                  Project Incharge -
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="border border-black p-2">1</td>
                      <td className="border border-black p-2">
                        SAP Code & Vendor Name
                      </td>
                      <td className="border border-black p-2">
                        {item?.vendorNo} &nbsp; {item?.vendorName}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">2</td>
                      <td className="border border-black p-2">
                        Nature of advance
                      </td>
                      <td className="border border-black p-2">
                        <div className="grid-cols-1">
                          <div>
                            Recoverable mobilisation/Non recoverable
                            mobilisation/Ad hoc advance
                          </div>
                          <div>
                            If mobilisation,QS certification attached - Yes / No
                          </div>
                          <div>
                            If against BG,date of expirty -___________________
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">3</td>
                      <td className="border border-black p-2">
                        If advance on behalf of Contractor
                      </td>
                      <td className="border border-black p-2 gird-cols-1">
                        <div>Yes / No</div>
                        <div>
                          If yes;Name of the
                          Controctor-________________________________________
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">4</td>
                      <td className="border border-black p-2">
                        Project Name & Region
                      </td>
                      <td className="border border-black p-2">
                        {item?.projectDescription}, {item?.region}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">5</td>
                      <td className="border border-black p-2">
                        PO No and Date and Amount
                      </td>
                      <td className="border border-black p-2">
                        {item?.poNo &&
                          `PO No: ${item?.poNo}, Date: ${formatDate(
                            item?.poDate
                          )}, Amount: ${item?.poAmt}`}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">6</td>
                      <td className="border border-black p-2">
                        If PO not raised, reason and other details
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">7</td>
                      <td className="border border-black p-2">
                        GST No of Vendor
                      </td>
                      <td className="border border-black p-2">
                        {item?.gstNumber}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">8</td>
                      <td className="border border-black p-2">
                        Payment is towards
                      </td>
                      <td className="border border-black p-2">
                        Material / Services / Material + Services/Work
                        Contract/Cement/Steel
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">9</td>
                      <td className="border border-black p-2">PAN Status</td>
                      <td className="border border-black p-2">
                        {item?.panStatus}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">10</td>
                      <td className="border border-black p-2">
                        Compliance u/s 206 AB
                      </td>
                      <td className="border border-black p-2">
                        {item?.compliance206AB}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">11</td>
                      <td className="border border-black p-2">Remarks</td>
                      <td className="border border-black p-2">
                        {item?.advancePercentage} -{" "}
                        {item?.approvalDetails?.remarksPimoMumbai}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">12</td>
                      <td className="border border-black p-2">Amount INR</td>
                      <td className="border border-black p-2">
                        {item?.currency} {item?.advanceAmt} (In
                        words___________________________________)
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">13</td>
                      <td className="border border-black p-2">
                        Advance request entered by
                      </td>
                      <td className="border border-black p-2">
                        {item?.advRequestEnteredBy}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">14</td>
                      <td className="border border-black p-2">
                        Addl.Remarks/Queries
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">15</td>
                      <td className="border border-black p-2">
                        Approval by Project Incharge & Trustee
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr className="font-medium text-xl">
                      <td className="bg-gray-200 p-2 border-l"></td>
                      <td className="bg-gray-200 p-2 text-center">
                        Accounts Department
                      </td>
                      <td className="bg-gray-200 p-2 border-r text-center">
                        Date________
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">16</td>
                      <td className="border border-black p-2">
                        TDS deductable u/s 194C/194J @
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">17</td>
                      <td className="border border-black p-2">
                        WCT decuctable @
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">18</td>
                      <td className="border border-black p-2">
                        Net Amount Payable{" "}
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">19</td>
                      <td className="border border-black p-2">
                        SAP Payment Doc.No{" "}
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">20</td>
                      <td className="border border-black p-2">
                        Advance In Vendor Account as on Date{" "}
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">21</td>
                      <td className="border border-black p-2">
                        Advance In Vendor Account agst above PO{" "}
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">22</td>
                      <td className="border border-black p-2">
                        Total advance agst above PO after this advance{" "}
                      </td>
                      <td className="border border-black p-2"></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-2">23</td>
                      <td className="border border-black p-2">
                        Approval by CFO{" "}
                      </td>
                      <td className="border border-black p-2"></td>
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
