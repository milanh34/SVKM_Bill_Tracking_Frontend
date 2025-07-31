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
            padding: 0px;
            font-size: 0.770rem;
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
            padding: 4px 6px;
            font-size: 0.770rem;
          }
          th {
            background-color: #f3f4f6;
            text-align: left;
          }
          tr:nth-child(even) { background-color: #f9fafb; }
          .logo-img { height: 40px; }
          .grid-row {
            display: grid;
            padding: 4px 0px;
            font-size: 0.770rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .grid-3 {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .grid-6 {
            grid-template-columns: repeat(6, 1fr);
            gap: 16px;
          }
          .grid-span-2 {
            grid-column: span 2;
          }
          .grid-span-4 {
            grid-column: span 4;
          }
        }
      </style>
    `;

    win.document.write(`
      <html>
        <head>
          <title>Account Checklist</title>
          ${printStyles}
        </head>
        <body>
    `);

    billsData.forEach((item) => {
      const content = `
        <div class="checklist-page">
          <div class="content-row">
            <img src="${logo}" alt="" class="logo-img" style="height: 40px; vertical-align: middle;" />
            &nbsp;&nbsp;&nbsp;
            Region-Project Name: ${item?.region || ""} - ${
        item?.projectDescription || ""
      }
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            ${item?.srNo || ""}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            Due Date:
          </div>

          <div class="grid-row grid-3">
            <div>Invoice No: ${item?.taxInvNo || ""}</div>
            <div>Dt: ${formatDate(item?.taxInvDate)}</div>
            <div>Nature of Work: ${
              item?.natureOfWork || item?.typeOfInv || ""
            }</div>
          </div>

          <div class="grid-row grid-6">
            <div class="grid-span-4">Vendor Description: ${
              item?.vendorName || ""
            }</div>
            <div class="grid-span-2">Vendor code: ${item?.vendorNo || ""}</div>
          </div>

          <div class="grid-row grid-6">
            <div class="grid-span-4">PO Number and Date: ${
              item?.poNo || ""
            } &nbsp; ${formatDate(item?.poDate)}</div>
            <div class="grid-span-2">PO Amt: ${item?.currency || ""} ${
        item?.poAmt || ""
      }</div>
          </div>

          <div class="grid-row grid-6">
            <div class="grid-span-4">Vendor GST No & PAN as per SAP: ${
              item?.gstNumber || ""
            } / ${vendorPANMap[item?.vendorNo] || ""}</div>
            <div class="grid-span-2">LC exists in vendor A/c: &nbsp; Yes / No</div>
          </div>

          <div class="grid-row grid-6">
            <div class="grid-span-4">Compliance u/s 206AB: ${
              item?.compliance206AB || ""
            }</div>
            <div class="grid-span-2">Pan Status: ${item?.panStatus || ""}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 33.333333%">Description</th>
                <th style="width: 33.333333%">Remarks</th>
                <th style="width: 33.333333%">Additional remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vendor Original Tax Invoice attached</td>
                <td>Yes / No</td>
                <td>SAP doc no.</td>
              </tr>
              <tr>
                <td>Invoice Approved By Project Incharge</td>
                <td>VP / JKB / RB / DG / PP /<br/>Shirpur/Dhule</td>
                <td>Same bill no.in vendor ledger: Yes / No<br/>Is Migo Entry done: Yes / No</td>
              </tr>
              <tr>
                <td>Invoice Approved By Trustee</td>
                <td>HS / HC / JP / JK / BP / RB / Member -LMC</td>
                <td>IS PO no mentioned on Bill? Yes / No<br/>IS PO no mentioned is correct? Yes / No</td>
              </tr>
              <tr>
                <td>Invoice Amount</td>
                <td>${item?.currency} ${item?.taxInvAmt}</td>
                <td>Bill for Material / services / material + services<br/>Total Material Purchases -&lt;50lacs / &gt;50 lacs</td>
              </tr>
              <tr>
                <td>TDS u/s 194C / 194J/194I or 194Q + TDS deducted-cement/steel,etc<br/>TDS deducted on cement/steel,etc.</td>
                <td>Rs.</td>
                <td>Net Amount: Rs.</td>
              </tr>
              <tr>
                <td>Is GST charged in bill</td>
                <td>Yes / No / RCM(Consult Mr Mekap)</td>
                <td>SVKM GST no mentioned on bill ? Yes / No</td>
              </tr>
              <tr>
                <td>Vendor Original Delivery Challan</td>
                <td>Yes - with stamp / Yes - w/o stamp</td>
                <td>No- with stamp on bill / No-Services<br/>No - w/o stamp on bill</td>
              </tr>
              <tr>
                <td>E-Way bill attached</td>
                <td>Yes - Part A avbl & Part B avbl<br/>Yes - bill to ship to E-Way bill avbl<br/>Yes - Works Contract E-way bill avbl</td>
                <td>No - distance &lt; 50 kms / No- Mat couriered<br/>No - inter state; amt &lt; 50,000/No-Mat hand delivery<br/>No - intra state; amt &lt; 1,00,000 /No -Services</td>
              </tr>
              <tr>
                <td>Loading/Unloading/Debris/Debit Note - by SVKM or Vendor</td>
                <td>Rs.</td>
                <td>G L Account:480<br/>Network:<br/>Activity:</td>
              </tr>
              <tr>
                <td>Purchase Order Copy attached</td>
                <td>Yes / No</td>
                <td>Is PO signed by authorised? Yes / No</td>
              </tr>
              <tr>
                <td>Vendor GST No as per Invoice</td>
                <td>Same / different</td>
                <td>Venor GST Validity : Yes / No</td>
              </tr>
              <tr>
                <td>Gleed's Certification Amount</td>
                <td>INR ${
                  item?.copDetails?.amount
                }<br/>N.A. for Mumbai; amt &lt; 50,000</td>
                <td>Is certificate signed & stamped? Yes / No<br/>Is PO no correct? Yes / No</td>
              </tr>
              <tr>
                <td>Retention Amount</td>
                <td>Rs.</td>
                <td>Gleeds COP amt : Rs.<br/>SAP Doc no : 35/<br/>Rs.</td>
              </tr>
              <tr>
                <td>This bill hold amount</td>
                <td>Rs.</td>
                <td>SAP Doc no : 35/<br/>Rs.</td>
              </tr>
              <tr>
                <td>Earlier bill hold release amount</td>
                <td>Rs.</td>
                <td></td>
              </tr>
              <tr>
                <td>Measurment Sheet/Drawings</td>
                <td>Yes / No</td>
                <td>PO no on measurement sheet same?<br/>Yes / No / Not mentioned</td>
              </tr>
              <tr>
                <td>Others</td>
                <td></td>
                <td>Declaration for no TDS :u/s 194 © received/ under notification 21/dated 13.06.12 received</td>
              </tr>
              <tr>
                <td>Advance in Vendor Account</td>
                <td>Rs.</td>
                <td>In various POs as on</td>
              </tr>
              <tr>
                <td>Advance adj. agst this Invoice</td>
                <td>Rs.</td>
                <td></td>
              </tr>
              <tr>
                <td>Net Payable</td>
                <td>Rs.</td>
                <td></td>
              </tr>
              <tr>
                <td>Project/Campus on Bill,PO and Certificate</td>
                <td>Same / different</td>
                <td>Not for payment since adjusted against advance. Email sent ? ________ /Entered in Access ___________</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      win.document.write(content);
    });

    win.document.write("</body></html>");
    win.document.close();

    const style = document.createElement("style");
    style.textContent = "@page { size: auto; margin: 0mm; }";
    win.document.head.appendChild(style);

    win.onload = () => {
      setTimeout(() => {
        win.document.title = "Account Checklist";
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
