import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useLocation } from "react-router-dom";
import print from "../../assets/print.svg";
import logo from "../../assets/logo.png";
import { vendors } from "../../apis/master.api";
import axios from "axios";
import Cookies from "js-cookie";

const ITEMS_PER_PAGE = 1;

const ChecklistAccount = () => {
  const location = useLocation();
  const billList = location.state?.selectedRows || [];
  const billsData = location.state?.bills || [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);
  const [vendorPANMap, setVendorPANMap] = useState({});

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

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get(vendors, {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        });
        console.log("Vendors data:", response.data);

        const panMap = {};
        response.data.forEach((vendor) => {
          if (vendor.vendorNo && vendor.PAN) {
            panMap[vendor.vendorNo] = vendor.PAN;
          }
        });
        setVendorPANMap(panMap);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  console.log("Bills Data:", billsData[0]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    
    if (!printWindow) {
      alert("Please allow pop-ups to enable printing");
      return;
    }

    const printStyles = `
      <style>
        @media print {
          @page {
            margin: 10mm;
            size: A4;
          }
          body { 
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin: 0;
            padding: 10px;
            color: #000;
          }
          .print-page {
            width: 100%;
            margin: 0 auto;
            page-break-after: always;
            background: white;
          }
          .print-page:last-child {
            page-break-after: avoid;
          }
          .header-section {
            border: 2px solid #000;
            margin-bottom: 10px;
          }
          .header-row {
            display: flex;
            justify-content: between;
            border-bottom: 1px solid #000;
            min-height: 25px;
            align-items: center;
          }
          .header-row-2 {
            display: flex;
            border-bottom: 1px solid #000;
            min-height: 25px;
            align-items: center;
            background-color: #bdbdbdff;
          }
          .header-row:last-child {
            border-bottom: none;
          }
          .header-cell {
            padding: 4px 8px;
            border-right: 1px solid #000;
            flex: 2;
          }
          .header-cell-1 {
            padding: 4px 8px;
            border-right: none !important;
            flex: 2;
          }
          .header-cell-2 {
            border-right: none;
            padding: 4px 8px;
            flex: 1;
          }
          .header-cell:last-child {
            border-right: none;
          }
          .header-cell.wide {
            flex: 2.5;
          }
          .narrow {
            flex: 0.5;
          }
          .duedate {
            width: fit-content;
          }
          .logo-section {
            display: flex;
            align-items: center;
            font-weight: bold;
            background-color: #f0f0f0;
          }
          .logo {
            height: 30px;
            margin-right: 10px;
          }
          .main-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-top: 10px;
          }
          .main-table th,
          .main-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
            vertical-align: top;
            font-size: 11px;
            line-height: 1.3;
          }
          .main-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }
          .main-table .desc-col {
            width: 30%;
          }
          .main-table .remarks-col {
            width: 31%;
          }
          .main-table .additional-col {
            width: 39%;
          }
          .row-data {
            font-weight: normal;
          }
          .small-text {
            font-size: 10px;
          }
          .amt {
            font-size: 20px !important;
            font-weight: 400;
          }
          .na-mum {
            font-size: 14px !important;
            font-weight: 200;
          }
        }
        @media screen {
          body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
          }
        }
      </style>
    `;

    let printContent = `
      <html>
        <head>
          <title>Account Checklist</title>
          ${printStyles}
        </head>
        <body>
    `;

    // Process each bill
    if (billsData) {
      billsData.forEach((item, index) => {
        printContent += `
          <div class="print-page">
            <!-- Header Section -->
            <div class="header-section">
              <!-- Logo and Project Info Row -->
              <div class="header-row logo-section">
                <div class="header-cell-1 wide">
                  <strong>SVKM</strong> &nbsp;&nbsp;&nbsp;
                  Project name: ${item?.region || ""}- ${item?.projectDescription || ""}
                </div>
                <div class="narrow">${item?.srNo || ""}</div>
                <div class="duedate">Due Date:__/__/____</div>
              </div>
              
              <!-- Invoice Details Row -->
              <div class="header-row-2">
                <div class="header-cell-2">Invoice no and Date: ${item?.taxInvNo || ""}</div>
                <div class="header-cell-2">Dt: ${formatDate(item?.taxInvDate)}</div>
                <div class="header-cell-2">Nature of Work: ${item?.natureOfWork || item?.typeOfInv || ""}</div>
              </div>
              
              <!-- Vendor Info Row -->
              <div class="header-row">
                <div class="header-cell wide">Vendor Description: ${item?.vendorName || ""}</div>
                <div class="header-cell">Vendor Code: ${item?.vendorNo || ""}</div>
              </div>
              
              <!-- PO Info Row -->
              <div class="header-row">
                <div class="header-cell wide">PO No and Date: ${item?.poNo || ""} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${formatDate(item?.poDate)}</div>
                <div class="header-cell">PO Amt: ${item?.currency || ""} ${item?.poAmt || ""}</div>
              </div>
              
              <!-- GST and PAN Row -->
              <div class="header-row">
                <div class="header-cell wide">Vendor GST No as per SAP: ${item?.gstNumber || ""}</div>
                <div class="header-cell">LC exist in vendor A/c: Yes / No</div>
              </div>
              
              <!-- Compliance Row -->
              <div class="header-row">
                <div class="header-cell wide">Compliance u/s 206AB: ${item?.compliance206AB || ""}</div>
                <div class="header-cell">PAN Status: ${item?.panStatus || ""}</div>
              </div>
            </div>

            <!-- Main Checklist Table -->
            <table class="main-table">
              <thead>
                <tr>
                  <th class="desc-col">Description</th>
                  <th class="remarks-col">Remarks</th>
                  <th class="additional-col">Additional remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="row-data">Vendor Original Tax Invoice attached</td>
                  <td class="row-data">Yes / No</td>
                  <td class="row-data">SAP doc no. 17/</td>
                </tr>
                
                <tr>
                  <td class="row-data">Invoice Approved By Project Incharge</td>
                  <td class="row-data">VP / JKB / RB / DG / PP /<br/>Shirpur/Dhule</td>
                  <td class="row-data">Same bill no. in vendor ledger: Yes / No<br/>Is MIGO entry done: Yes / No</td>
                </tr>
                
                <tr>
                  <td class="row-data">Invoice Approved By Trustee</td>
                  <td class="row-data">HS / HC / JP / JK / BP / RB /<br/>Member -LMC</td>
                  <td class="row-data">IS PO no mentioned on Bill? Yes / No<br/>IS PO no mentioned is correct? Yes / No</td>
                </tr>
                
                <tr>
                  <td class="row-data">Invoice Amount</td>
                  <td class="row-data amt">${item?.currency || "INR"} ${item?.taxInvAmt || ""}</td>
                  <td class="row-data">Bill for Material / services / material + services<br/>Total Material Purchases - < 50 lacs / > 50 lacs</td>
                </tr>
                
                <tr>
                  <td class="row-data">TDS u/s 194C / 194J / 194I or 194Q<br/>+ TDS deducted- cement/steel,etc.</td>
                  <td class="row-data">Rs.</td>
                  <td class="row-data">Net amount : Rs.</td>
                </tr>
                
                <tr>
                  <td class="row-data">Is GST charged in bill</td>
                  <td class="row-data">Yes / No / RCM (consult Mr Mekap)</td>
                  <td class="row-data">SVKM GST no mentioned on bill? Yes / No</td>
                </tr>
                
                <tr>
                  <td class="row-data">Vendor Original Delivery Challan</td>
                  <td class="row-data">Yes - with Stamp<br/>Yes - w/o Stamp</td>
                  <td class="row-data">No - with Stamp on bill / No - Services<br/>No - w/o Stamp on bill</td>
                </tr>
                
                <tr>
                  <td class="row-data">E Way bill attached</td>
                  <td class="row-data">Yes - Part A avbl & Part B avbl<br/>Yes - bill to ship to E-Way bill avbl<br/>Yes - Works Contract E-way bill avbl</td>
                  <td class="row-data">No - distance < 50 kms / No- Mat couriered<br/>No - inter state; amt < 50,000/No-Mat hand delivery<br/>No - intra state; amt < 1,00,000 /No -Services</td>
                </tr>
                
                <tr>
                  <td class="row-data">Loading / Unloading / Debris /<br/>Debit Note - by SVKM or Vendor</td>
                  <td class="row-data">Rs.</td>
                  <td class="row-data">G L account: 480<br/>Network: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Activity:</td>
                </tr>
                
                <tr>
                  <td class="row-data">Purchase Order Copy attached</td>
                  <td class="row-data">Yes / No</td>
                  <td class="row-data">Is PO signed by authorised? Yes/No</td>
                </tr>
                
                <tr>
                  <td class="row-data">Vendor GST No as per Invoice</td>
                  <td class="row-data">Same / different<br/>If diff, check Venor PAN & RTGS details</td>
                  <td class="row-data">Vendor GST validity: Yes / No</td>
                </tr>
                
                <tr>
                  <td class="row-data">Gleed's Certification Amount</td>
                  <td class="row-data amt">INR ${item?.copDetails?.amount || "18,644.00"}<br/>
                  <p class="na-mum">N.A. for Mumbai; amt < 50,000 </p>
                  </td>
                  <td class="row-data">Is certificate signed & stamped? Yes / No<br/>Is PO no correct? Yes / No</td>
                </tr>
                
                <tr>
                  <td class="row-data">Retention Amount</td>
                  <td class="row-data">Rs.</td>
                  <td class="row-data">Gleeds COP amt: <br/>Rs.SAP doc no: 35/</td>
                </tr>
                
                <tr>
                  <td class="row-data">This bill hold amount</td>
                  <td class="row-data">Rs.</td>
                  <td class="row-data">SAP doc no: 10/<br/>SAP doc no: 10/</td>
                </tr>
                
                <tr>
                  <td class="row-data">Earlier bill hold/retention release amount</td>
                  <td class="row-data">Rs.</td>
                  <td class="row-data"></td>
                </tr>
                
                <tr>
                  <td class="row-data">Measurment Sheet/Drawings</td>
                  <td class="row-data">Yes / No</td>
                  <td class="row-data">PO no on measurement sheet same?<br/>Yes / No / Not mentioned</td>
                </tr>
                
                <tr>
                  <td class="row-data">Others</td>
                  <td class="row-data"></td>
                  <td class="row-data">Declaration for no TDS : u/s 194 C (6) received/<br/>under notification 21/dated 13.06.12 received</td>
                </tr>
                
                <tr>
                  <td class="row-data">Advance in Vendor Account</td>
                  <td class="row-data">Rs.</td>
                  <td class="row-data">In various POs as on</td>
                </tr>
                
                <tr>
                  <td class="row-data">Advance adj. agst this invoice</td>
                  <td class="row-data">Rs.</td>
                  <td class="row-data"></td>
                </tr>
                
                <tr>
                  <td class="row-data">Net Payable</td>
                  <td class="row-data">Rs.</td>
                  <td class="row-data"></td>
                </tr>
                
                <tr>
                  <td class="row-data">Project / Campus on Bill, PO and Certificate</td>
                  <td class="row-data">Same / different</td>
                  <td class="row-data">Not for payment since adjusted against advance.<br/>Email sent?_______ / Entered in Access ___</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      });
    }

    printContent += `
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Don't close immediately to allow user to see print dialog
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
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
          Print All Account Checklist <img src={print} alt="Print Icon" />
        </button>
      </div>

      <div className="overflow-x-auto p-6 min-h-screen">
        {currentItems.map((item, index) => (
          <div key={index}>
            <div className="w-full max-w-[90%] mx-auto">
              <div className="border border-gray-300 bg-white font-semibold">
                <div className="grid grid-cols-4 bg-gray-200 items-center">
                  <div className="p-2 border-b col-span-2 border-gray-300 flex items-center">
                    <div className="text-sm font-semibold">
                      <img src={logo} alt="" className="h-10" />
                    </div>
                    &nbsp; &nbsp;
                    <div className="text-sm">
                      Region-Project Name: {item?.region} -{" "}
                      {item?.projectDescription}
                    </div>
                  </div>
                  <div className="border-gray-300">
                    <div className="text-sm text-center">{item?.srNo}</div>
                  </div>
                  <div className="border-gray-300">
                    <div className="text-sm text-center">Due Date:</div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>Invoice No: {item?.taxInvNo}</div>
                    <div>Dt: {formatDate(item?.taxInvDate)}</div>
                    <div>
                      Nature of Work: {item?.natureOfWork || item?.typeOfInv}
                    </div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="col-span-3">
                      Vendor Description: {item?.vendorName}
                    </div>
                    <div>Vendor code: {item?.vendorNo}</div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="col-span-3">
                      PO Number and Date: {item?.poNo} &nbsp; &nbsp;
                      {formatDate(item?.poDate)}
                    </div>
                    <div>
                      PO Amt: {item?.currency} {item?.poAmt}
                    </div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="col-span-3">
                      Vendor GST No & PAN as per SAP: {item?.gstNumber || ""} /{" "}
                      {vendorPANMap[item?.vendorNo] || ""}
                    </div>
                    <div>LC exists in vendor A/c: &nbsp; Yes / No</div>
                  </div>
                </div>

                <div className="p-2 border-b border-gray-300">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="col-span-3">
                      Compliance u/s 206AB: {item?.compliance206AB}
                    </div>
                    <div>Pan Status: {item?.panStatus}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[90%] mx-auto flex flex-col gap-4">
              <div className="bg-white rounded shadow">
                <div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">
                            Description
                          </th>
                          <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">
                            Remarks
                          </th>
                          <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">
                            Additional remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Row 1 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Vendor Original Tax Invoice attached
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex gap-2">
                              <div>Yes</div>
                              <div>/</div>
                              <div>No</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <span>SAP doc no.</span>
                            </div>
                          </td>
                        </tr>

                        {/* Row 2 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Invoice Approved By Project Incharge
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <div>VP / JKB / RB / DG / PP /</div>
                              <div>Shirpur/Dhule</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <div>
                                Same bill no.in vendor ledger: &nbsp; Yes &nbsp;
                                / &nbsp; No
                              </div>
                              <div>
                                Is Migo Entry done: &nbsp; Yes &nbsp; / &nbsp;
                                No
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 3 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Invoice Approved By Trustee
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>HS / HC / JP / JK / BP / RB / Member -LMC</div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-2">
                              <div>
                                IS PO no mentioned on Bill? &nbsp; Yes &nbsp; /
                                &nbsp; No
                              </div>
                              <div>
                                IS PO no mentioned is correct? &nbsp; Yes &nbsp;
                                / &nbsp; No
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 4 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Invoice Amount
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>
                              {item?.currency} {item?.taxInvAmt}
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <div>
                                {" "}
                                Bill for Material / services / material +
                                services
                              </div>
                              <div>
                                Total Material Purchases -&lt;50lacs / &gt;50
                                lacs
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 5 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium flex-col">
                            <div>
                              TDS u/s 194C / 194J/194I or 194Q + TDS
                              deducted-cement/steel,etc
                            </div>
                            <div>TDS deducted on cement/steel,etc.</div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>Rs.</div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            Net Amount: Rs.
                          </td>
                        </tr>

                        {/* Row 7 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Is GST charged in bill
                          </td>
                          <td className="border border-gray-300 p-2">
                            Yes / No / RCM(Consult Mr Mekap)
                          </td>
                          <td className="border border-gray-300 p-2">
                            SVKM GST no mentioned on bill ? Yes &nbsp; / &nbsp;
                            No
                          </td>
                        </tr>

                        {/* Row 8 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Vendor Original Delivery Challan
                          </td>
                          <td className="border-0 border-gray-300 p-2 flex justify-between  w-full">
                            <div>Yes - with stamp</div>
                            <div>Yes - w/o stamp</div>
                          </td>
                          <td className="border border-gray-300 p-2 flex-col">
                            <div>
                              No- with stamp on bill &nbsp; / No-Services{" "}
                            </div>
                            <div>No - w/o stamp on bill</div>
                          </td>
                        </tr>

                        {/* Row 9 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            E-Way bill attached
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <div>Yes - Part A avbl & Part B avbl</div>
                              <div>Yes - bill to ship to E-Way bill avbl</div>
                              <div>Yes - Works Contract E-way bill avbl</div>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <div>
                                No - distance &lt; 50 kms / No- Mat couriered
                              </div>
                              <div>
                                No - inter state; amt &lt; 50,000/No-Mat hand
                                delivery
                              </div>
                              <div>
                                No - intra state; amt &lt; 1,00,000 /No
                                -Services
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 10 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Loading/Unloading/Debris/Debit Note - by SVKM or
                            Vendor
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex items-center">
                              <span className="mr-2">Rs.</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-2 flex-col">
                            <div>G L Account:480</div>
                            <div className="grid grid-cols-2">
                              <div>Network:</div>
                              <div>Activity:</div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 11 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Purchase Order Copy attached
                          </td>
                          <td className="border border-gray-300 p-2">
                            Yes &nbsp; / &nbsp; No
                          </td>
                          <td className="border border-gray-300 p-2">
                            Is PO signed by authorised? Yes &nbsp; / &nbsp; No
                          </td>
                        </tr>

                        {/* Row 12 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Vendor GST No as per Invoice
                          </td>
                          <td className="border border-gray-300 p-2">
                            Same &nbsp; / &nbsp; different
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex flex-col gap-1">
                              <div>Venor GST Validity : Yes / No</div>
                            </div>
                          </td>
                        </tr>

                        {/* Row 14 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Gleed's Certification Amount
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>INR {item?.copDetails?.amount}</div>
                            <div>N.A. for Mumbai; amt &lt; 50,000</div>
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>Is certificate signed & stamped? Yes / No</div>
                            <div>Is PO no correct? Yes / No</div>
                          </td>
                        </tr>

                        {/* Row 15 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Retention Amount
                          </td>
                          <td className="border border-gray-300 p-2">Rs.</td>
                          <td className="border border-gray-300 p-2">
                            <div>Gleeds COP amt : Rs.</div>
                            <div>SAP Doc no : 35/</div>
                            <div>Rs.</div>
                          </td>
                        </tr>

                        {/* Row 16 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            This bill hold amount
                          </td>
                          <td className="border border-gray-300 p-2">Rs.</td>
                          <td className="border border-gray-300 p-2">
                            <div>SAP Doc no : 35/</div>
                            <div>Rs.</div>
                          </td>
                        </tr>

                        {/* Row 17 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Earlier bill hold release amount
                          </td>
                          <td className="border border-gray-300 p-2">Rs.</td>
                          <td className="border border-gray-300 p-2"></td>
                        </tr>

                        {/* Row 18 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Measurment Sheet/Drawings
                          </td>
                          <td className="border border-gray-300 p-2">
                            Yes / No
                          </td>
                          <td className="border border-gray-300 p-2">
                            <div>PO no on measurement sheet same?</div>
                            <div>Yes / No / Not mentioned</div>
                          </td>
                        </tr>

                        {/* Row 19 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Others
                          </td>
                          <td className="border border-gray-300 p-2"></td>
                          <td className="border border-gray-300 p-2">
                            Declaration for no TDS :u/s 194 © received/ under
                            notification 21/dated 13.06.12 received
                          </td>
                        </tr>

                        {/* Row 20 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Advance in Vendor Account
                          </td>
                          <td className="border border-gray-300 p-2">Rs.</td>
                          <td className="border border-gray-300 p-2">
                            In various POs as on
                          </td>
                        </tr>

                        {/* Row 21 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Advance adj. agst this Invoice
                          </td>
                          <td className="border border-gray-300 p-2">Rs.</td>
                          <td className="border border-gray-300 p-2"></td>
                        </tr>

                        {/* Row 22 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Net Payable
                          </td>
                          <td className="border border-gray-300 p-2">Rs.</td>
                          <td className="border border-gray-300 p-2"></td>
                        </tr>

                        {/* Row 23 */}
                        <tr>
                          <td className="border border-gray-300 p-2 font-medium">
                            Project/Campus on Bill,PO and Certificate
                          </td>
                          <td className="border border-gray-300 p-2">
                            Same / different
                          </td>
                          <td className="border border-gray-300 p-2">
                            Not for payment since adjusted against advance.
                            Email sent ? ________ /Entered in Access ___________
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
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
      </div>
    </>
  );
};

export default ChecklistAccount;