import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import { bills } from "../apis/bills.api";
import imageBox from "../assets/img-box.svg";

const BillDetailsPIMO = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
          .bill-form select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background: white url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>") no-repeat right 0.75rem center;
            padding-right: 2.5rem;
          }
          .bill-form select::-webkit-scrollbar {
            width: 6px;
          }
          .bill-form select::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .bill-form select::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .bill-form select::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [billFormData, setBillFormData] = useState({
    invoiceType: "",
    region: "",
    projectDesc: "",
    gstNo: "",
    vendorName: "",
    vendorNo: "",
    compliance206: "",
    panStatus: "",
    poCreated: "",
    poNo: "",
    poDate: "",
    poAmt: "",
    proformaInvNo: "",
    proformaInvAmt: "",
    proformaInvDate: "",
    proformaInvRecdDate: "",
    taxInvNo: "",
    taxInvDate: "",
    taxInvAmt: "",
    taxInvRecdBy: "",
    taxInvRecdAtSite: "",
    currency: "",
    department: "",
    remarksSiteTeam: "",
    billImg: "",

    advDate: "",
    advAmt: "",
    advPercent: "",
    advReqEnteredBy: "",

    checkingDate: "",
    dateGivenToQS: "",
    qsName: "",
    dateGivenToQSforCOP: "",
    copDate: "",
    copAmt: "",
    remarksQsTeam: "",

    dateGivenToQSMum: "",
    nameQS: "",
    dateGivenToPIMOmum: "",
    pimoName: "",

    dateGivenToIT: "",
    nameGivenToIT: "",
    nameGivenToPIMO: "",
    sesNo: "",
    sesAmt: "",
    dateSes: "",
    dateRecdFromIT: "",
    dateRecdFromPIMO: "",

    dateGivenToDirector: "",
    dateGivenToAdmin: "",
    dateGivenToTrustee: "",
    dateRecdBackToPIMO: "",
    remarksPIMO: "",
    dateGivenToAccounts: "",
    nameGivenByPimoOff: "",
    dateRecdByAccounts: "",
    dateReturnToPIMO: "",
    dateRecdBackInAccounts: "",

    paymentInstruc: "",
    remarksForPay: "",
    f110Identification: "",
    datePayment: "",

    accountsIdentification: "",
    paymentAmount: "",
    remarksByAccounts: "",
    status: "",
  });

  const [billImage, setBillImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Clean up the preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { id, type, files } = e.target;

    if (id === "billImg" && files && files[0]) {
      setBillImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
      setBillFormData((prevData) => ({
        ...prevData,
        billImg: files[0].name,
      }));
    } else {
      setBillFormData((prevData) => ({
        ...prevData,
        [id]: e.target.value,
      }));
    }
  };

  const dateInputRef = useRef(null);

  const handleInputClick = () => {
    dateInputRef.current.focus();
  };

  const handleSubmitForm = () => {
    const requiredFields = [
      "invoiceType",
      "region",
      "projectDesc",
      "vendorName",
      "vendorNo",
      "poCreated",
      "proformaInvRecdDate",
      "taxInvRecdBy",
      "department",
      "status",
    ];

    const missingFields = requiredFields.filter(
      (field) => !billFormData[field]
    );

    if (missingFields.length > 0) {
      alert(
        `Please fill in the following required fields: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    fetch(bills, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(billFormData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  };

  return (
    <div className="bg-white text-black pb-2">
      <Header />

      <div className="max-w-[92.55vw] border-2 border-[#4E4E4E25] rounded-xl p-[3vh_2vw] font-arial mx-auto bill-form">
        <div>
          <h1 className="text-[#000B3E] mb-[4.7vh] text-[35px] font-bold">
            Bill Details
          </h1>

          <div>
            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="invoiceType"
                >
                  Type of Invoice *
                </label>
                <select
                  id="invoiceType"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  value={billFormData.invoiceType}
                  onChange={handleChange}
                >
                  <option value="" disabled hidden selected>
                    Select Type of Invoice
                  </option>
                  <option value="Proforma Invoice">Proforma Invoice</option>
                  <option value="Credit Note">Credit Note</option>
                  <option value="Advance/LC/BG">Advance/LC/BG</option>
                  <option value="Direct FI Entry">Direct FI Entry</option>
                  <option value="Utility Work">Utility Work</option>
                  <option value="Petty cash">Petty cash</option>
                  <option value="Hold/Ret Release">Hold/Ret Release</option>
                  <option value="Imports">Imports</option>
                  <option value="Equipments">Equipments</option>
                  <option value="Materials">Materials</option>
                  <option value="IT related">IT related</option>
                  <option value="IBMS">IBMS</option>
                  <option value="Consultancy bill">Consultancy bill</option>
                  <option value="Civil Works">Civil Works</option>
                  <option value="Petrol/Diesel">Petrol/Diesel</option>
                  <option value="STP Work">STP Work</option>
                  <option value="HVAC Work">HVAC Work</option>
                  <option value="MEP Work">MEP Work</option>
                  <option value="Fire Fighting Work">Fire Fighting Work</option>
                  <option value="Painting work">Painting work</option>
                  <option value="Site Infra">Site Infra</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Housekeeping/Security">
                    Housekeeping/Security
                  </option>
                  <option value="Overheads">Overheads</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="relative mb-[2.5vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="region"
                >
                  Region *
                </label>
                <select
                  id="region"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  value={billFormData.region}
                  onChange={handleChange}
                >
                  <option value="" disabled hidden selected>
                    Select Region
                  </option>
                  <option value="MUMBAI">MUMBAI</option>
                  <option value="KHARGHAR">KHARGHAR</option>
                  <option value="AHMEDABAD">AHMEDABAD</option>
                  <option value="BANGALURU">BANGALURU</option>
                  <option value="BHUBANESHWAR">BHUBANESHWAR</option>
                  <option value="CHANDIGARH">CHANDIGARH</option>
                  <option value="DELHI">DELHI</option>
                  <option value="NOIDA">NOIDA</option>
                  <option value="NAGPUR">NAGPUR</option>
                  <option value="GANSOLI">GANSOLI</option>
                  <option value="HOSPITAL">HOSPITAL</option>
                  <option value="DHULE">DHULE</option>
                  <option value="SHIRPUR">SHIRPUR</option>
                  <option value="INDORE">INDORE</option>
                  <option value="HYDERABAD">HYDERABAD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="projectDesc"
                >
                  Project Description *
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="projectDesc"
                  value={billFormData.projectDesc}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[2.5vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="gstNo"
                >
                  GST Number
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="gstNo"
                  value={billFormData.gstNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="vendorName"
                >
                  Vendor Name *
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="vendorName"
                  value={billFormData.vendorName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[2.5vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="vendorNo"
                >
                  Vendor No *
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="vendorNo"
                  value={billFormData.vendorNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="compliance206"
                >
                  206AB Compliance
                </label>
                <select
                  id="compliance206"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  value={billFormData.compliance206}
                  onChange={handleChange}
                >
                  <option value="" disabled hidden selected>
                    Select 206AB Compliance
                  </option>
                  <option value="206AB Check on Website">
                    206AB Check on Website
                  </option>
                  <option value="2024-Specified Person U/S 206AB">
                    2024-Specified Person U/S 206AB
                  </option>
                  <option value="2024-Non-Specified Person U/S 206AB">
                    2024-Non-Specified Person U/S 206AB
                  </option>
                  <option value="2025-Specified Person U/S 206AB">
                    2025-Specified Person U/S 206AB
                  </option>
                  <option value="2025-Non-Specified Person U/S 206AB">
                    2025-Non-Specified Person U/S 206AB
                  </option>
                </select>
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="panStatus"
                >
                  PAN Status
                </label>
                <select
                  id="panStatus"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  value={billFormData.panStatus}
                  onChange={handleChange}
                >
                  <option value="" disabled hidden selected>
                    Select PAN Status
                  </option>
                  <option value="PAN operative/N.A">PAN operative/N.A</option>
                  <option value="PAN inoperative">PAN inoperative</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="poCreated"
                >
                  Is PO already Created? *
                </label>
                <select
                  id="poCreated"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  value={billFormData.poCreated}
                  onChange={handleChange}
                >
                  <option value="" selected disabled hidden>
                    Select PO Created or Not
                  </option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="poNo"
                >
                  PO No.
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="poNo"
                  value={billFormData.poNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="poDate"
                >
                  PO Date
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="poDate"
                  value={billFormData.poDate}
                  onChange={handleChange}
                  onClick={handleInputClick}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="poAmt"
                >
                  PO Amount
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="poAmt"
                  value={billFormData.poAmt}
                  onChange={handleChange}
                  required
                />
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="proformaInvNo"
                >
                  Proforma Invoice No
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="proformaInvNo"
                  value={billFormData.proformaInvNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="proformaInvDate"
                >
                  Proforma Inv Date
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="proformaInvDate"
                  value={billFormData.proformaInvDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="proformaInvAmt"
                >
                  Proforma Invoice Amount
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="proformaInvAmt"
                  value={billFormData.proformaInvAmt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="proformaInvRecdDate"
                >
                  Proforma Inv Recd at Site *
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="proformaInvRecdDate"
                  value={billFormData.proformaInvRecdDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="taxInvNo"
                >
                  Tax Invoice No.
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="taxInvNo"
                  value={billFormData.taxInvNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="taxInvDate"
                >
                  Tax Inv Date
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="taxInvDate"
                  value={billFormData.taxInvDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="currency"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  value={billFormData.currency}
                  onChange={handleChange}
                >
                  <option value="" selected disabled hidden>
                    Select Currency
                  </option>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="RMB">RMB</option>
                  <option value="EURO">EURO</option>
                </select>
              </div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="taxInvRecdAtSite"
                >
                  Tax Invoice Received At Site
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="taxInvRecdAtSite"
                  value={billFormData.taxInvRecdAtSite}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div>
                <div className="relative mb-[4vh]">
                  <label
                    className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                    htmlFor="taxInvAmt"
                  >
                    Tax Invoice Amount
                  </label>
                  <input
                    type="number"
                    className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                    id="taxInvAmt"
                    value={billFormData.taxInvAmt}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative mb-[4vh]">
                  <label
                    className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                    htmlFor="taxInvRecdBy"
                  >
                    Tax Inv Received By *
                  </label>
                  <input
                    type="text"
                    className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                    id="taxInvRecdBy"
                    value={billFormData.taxInvRecdBy}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative mb-[4vh]">
                  <label
                    className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                    htmlFor="department"
                  >
                    Department *
                  </label>
                  <input
                    type="text"
                    className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                    id="department"
                    value={billFormData.department}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="relative mb-[4vh]">
                  <label
                    className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                    htmlFor="remarksSiteTeam"
                  >
                    Remarks by Site Team
                  </label>
                  <input
                    type="text"
                    className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                    id="remarksSiteTeam"
                    value={billFormData.remarksSiteTeam}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="relative border-dashed z-50 float-right border-[#ccc] rounded-xl border-[0.25vh]">
                <label
                  htmlFor="billImg"
                  className="absolute inset-0 w-full h-full cursor-pointer flex flex-col items-center justify-center"
                >
                  {imagePreview ? (
                    <div className="mb-4">
                      <img
                        src={imagePreview}
                        alt="Bill preview"
                        className="max-w-[250px] max-h-[250px] object-contain mx-auto"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-[#666] text-[1vw]">
                        Upload image of the bill
                      </p>
                      <img
                        src={imageBox}
                        alt="Upload placeholder"
                        className="w-[6vw] h-[6vw] mb-[1vh]"
                      />
                    </>
                  )}
                  {billImage && (
                    <p className="text-[#666] text-[0.8vw] mt-2">
                      {billImage.name}
                    </p>
                  )}
                </label>
                <input
                  type="file"
                  id="billImg"
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex mt-[4vh]">
          <div className="w-1/2">
            <h1 className="text-[#000B3E] mb-[4.7vh] text-[35px] font-bold">
              Advanced Details
            </h1>

            <div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="advDate"
                >
                  Advanced Date
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="advDate"
                  value={billFormData.advDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="advAmt"
                >
                  Advance Amount
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="advAmt"
                  value={billFormData.advAmt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="advPercent"
                >
                  Advance Percentage
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="advPercent"
                  value={billFormData.advPercent}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="advReqEnteredBy"
                >
                  Advance Request Entered By{" "}
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="advReqEnteredBy"
                  value={billFormData.advReqEnteredBy}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="ml-[1vw] w-1/2">
            <h1 className="text-[#000B3E] mb-[4.7vh] text-[35px] font-bold">
              Quality Surveyor Details
            </h1>

            <div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="checkingDate"
                >
                  Date of Checking
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="checkingDate"
                  value={billFormData.checkingDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToQS"
                >
                  Date Given to QS for Inspection
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToQS"
                  value={billFormData.dateGivenToQS}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="qsName"
                >
                  Name of QS
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="qsName"
                  value={billFormData.qsName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToQSforCOP"
                >
                  Date Given to QS for COP
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToQSforCOP"
                  value={billFormData.dateGivenToQSforCOP}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="copDate"
                >
                  COP Date
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="copDate"
                  value={billFormData.copDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="copAmt"
                >
                  COP Amount
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="copAmt"
                  value={billFormData.copAmt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="remarksQsTeam"
                >
                  Remarks by QS Team
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="remarksQsTeam"
                  value={billFormData.remarksQsTeam}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToQSMum"
                >
                  Date Given to QS Mumbai
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToQSMum"
                  value={billFormData.dateGivenToQSMum}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToPIMOmum"
                >
                  Date Given to PIMO Mumbai
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToPIMOmum"
                  value={billFormData.dateGivenToPIMOmum}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[2vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="nameQS"
                >
                  Name of QS
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="nameQS"
                  value={billFormData.nameQS}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="pimoName"
                >
                  Name - PIMO
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="pimoName"
                  value={billFormData.pimoName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex mt-[4vh]">
          <div className="w-1/2">
            <div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToIT"
                >
                  Date Given to IT Dept
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToIT"
                  value={billFormData.dateGivenToIT}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="nameGivenToIT"
                >
                  Name - given to IT Dept
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] "
                  id="nameGivenToIT"
                  value={billFormData.nameGivenToIT}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToPIMOmum"
                >
                  Date Given to PIMO Mumbai
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToPIMOmum"
                  value={billFormData.dateGivenToPIMOmum}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="sesNo"
                >
                  SES No.
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] "
                  id="sesNo"
                  value={billFormData.sesNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="sesAmt"
                >
                  SES Amount
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] "
                  id="sesAmt"
                  value={billFormData.sesAmt}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateSes"
                >
                  SES Date
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateSes"
                  value={billFormData.dateSes}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateRecdFromIT"
                >
                  Date Recieved From IT Dept
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateRecdFromIT"
                  value={billFormData.dateRecdFromIT}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateRecdFromPIMO"
                >
                  Date Recieved From PIMO
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateRecdFromPIMO"
                  value={billFormData.dateRecdFromPIMO}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="nameGivenToPIMO"
                >
                  Name - given to PIMO Mumbai
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="nameGivenToPIMO"
                  value={billFormData.nameGivenToPIMO}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <div className="ml-[1vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToDirector"
                >
                  Date Given to Director to Approve
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToDirector"
                  value={billFormData.dateGivenToDirector}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToAdmin"
                >
                  Date Given to Admin to Approve
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToAdmin"
                  value={billFormData.dateGivenToAdmin}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToTrustee"
                >
                  Date Given to Trustee to Approve
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToTrustee"
                  value={billFormData.dateGivenToTrustee}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateRecdBackToPIMO"
                >
                  Date Recieved back to PIMO after Approval
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateRecdBackToPIMO"
                  value={billFormData.dateRecdBackToPIMO}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="remarksPIMO"
                >
                  Remarks PIMO Mumbai
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="remarksPIMO"
                  value={billFormData.remarksPIMO}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateGivenToAccounts"
                >
                  Date Given to Account Dept
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToAccounts"
                  value={billFormData.dateGivenToAccounts}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="nameGivenByPimoOff"
                >
                  Name - given by PIMO Office
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="nameGivenByPimoOff"
                  value={billFormData.nameGivenByPimoOff}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateRecdByAccounts"
                >
                  Date Recieved by Account Dept
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateRecdByAccounts"
                  value={billFormData.dateRecdByAccounts}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateReturnToPIMO"
                >
                  Date Returned to PIMO
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateReturnToPIMO"
                  value={billFormData.dateReturnToPIMO}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="dateRecdBackInAccounts"
                >
                  Date Recieved Back to Accounts Dept
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateRecdBackInAccounts"
                  value={billFormData.dateRecdBackInAccounts}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex mt-[4vh]">
          <div className="w-1/2">
            <div>
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="paymentInstruc"
                >
                  Payment Instructions
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="paymentInstruc"
                  value={billFormData.paymentInstruc}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="remarksForPay"
                >
                  Remarks for Payment Instructions
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="remarksForPay"
                  value={billFormData.remarksForPay}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="f110Identification"
                >
                  F110 Identification
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="f110Identification"
                  value={billFormData.f110Identification}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="datePayment"
                >
                  Date of Payment
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="datePayment"
                  value={billFormData.datePayment}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <div className="ml-[1vw]">
              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="accountsIdentification"
                >
                  Accounts Identification`
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="accountsIdentification"
                  value={billFormData.accountsIdentification}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="paymentAmount"
                >
                  Payment Amount
                </label>
                <input
                  type="number"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="paymentAmount"
                  value={billFormData.paymentAmount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="remarksByAccounts"
                >
                  Remarks by Account Dept
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="remarksByAccounts"
                  value={billFormData.remarksByAccounts}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="status"
                >
                  Status *
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="status"
                  value={billFormData.status}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <button
          className="flex justify-center items-center bg-[#011A99] text-white mt-[12vh] w-[84vw] h-[6.8vh] border-none rounded-[0.5vw] cursor-pointer text-[2.5vh] mx-auto hover:bg-[#021678] active:bg-[#004085]"
          type="submit"
          onClick={handleSubmitForm}
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default BillDetailsPIMO;
