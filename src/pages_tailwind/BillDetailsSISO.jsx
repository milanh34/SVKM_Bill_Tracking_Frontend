import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import BillDetails from "../pages/BillDetails";
import { bills } from "../apis/bills.api";
import imageBox from "../assets/img-box.svg";

const BillDetailsSISO = () => {
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
    poCreated: "No",
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
    currency: "",
    department: "",
    remarksSiteTeam: "",
    billImg: "",

    checkingDate: "",
    dateGivenToQualEng: "",
    nameQualEng: "",
    dateGivenToQSforInspect: "",
    nameQS: "",

    dateGivenForMigo: "",
    migoDate: "",
    migoNo: "",
    migoAmt: "",
    migoDoneBy: "",

    invDateReturnSiteOff: "",
    dateGivenToSiteEng: "",
    nameSiteEng: "",
    remarksSiteEng: "",
    dateGivenToArchi: "",
    nameArchi: "",
    remarksArchi: "",
    dateGivenToSiteIncharge: "",
    nameSiteIncharge: "",
    remarksSiteIncharge: "",
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
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
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
                  value={BillDetails.invoiceType}
                  onChange={handleChange}
                  required
                >
                  <option value="" selected disabled hidden>
                    Select Invoice Type
                  </option>
                  <option value={BillDetails.invoiceType}>
                    Proforma Invoice
                  </option>
                  <option value={BillDetails.invoiceType}>Credit Note</option>
                  <option value={BillDetails.invoiceType}>Advance/LC/BG</option>
                  <option value={BillDetails.invoiceType}>
                    Direct FI Entry
                  </option>
                  <option value={BillDetails.invoiceType}>Utility Work</option>
                  <option value={BillDetails.invoiceType}>Petty cash</option>
                  <option value={BillDetails.invoiceType}>
                    Hold/Ret Release
                  </option>
                  <option value={BillDetails.invoiceType}>Imports</option>
                  <option value={BillDetails.invoiceType}>Equipments</option>
                  <option value={BillDetails.invoiceType}>Materials</option>
                  <option value={BillDetails.invoiceType}>IT related</option>
                  <option value={BillDetails.invoiceType}>IBMS</option>
                  <option value={BillDetails.invoiceType}>
                    Consultancy bill
                  </option>
                  <option value={BillDetails.invoiceType}>Civil Works</option>
                  <option value={BillDetails.invoiceType}>Petrol/Diesel</option>
                  <option value={BillDetails.invoiceType}>STP Work</option>
                  <option value={BillDetails.invoiceType}>HVAC Work</option>
                  <option value={BillDetails.invoiceType}>MEP Work</option>
                  <option value={BillDetails.invoiceType}>
                    Fire Fighting Work
                  </option>
                  <option value={BillDetails.invoiceType}>Painting work</option>
                  <option value={BillDetails.invoiceType}>Site Infra</option>
                  <option value={BillDetails.invoiceType}>Carpentry</option>
                  <option value={BillDetails.invoiceType}>
                    Housekeeping/Security
                  </option>
                  <option value={BillDetails.invoiceType}>Overheads</option>
                  <option value={BillDetails.invoiceType}>Others</option>
                </select>
              </div>

              <div className="relative mb-[4vh]">
                <label
                  className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none"
                  htmlFor="region"
                >
                  Region *
                </label>
                <select
                  id="region"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  value={BillDetails.region}
                  onChange={handleChange}
                  required
                >
                  <option value="" selected disabled hidden>
                    Select Region
                  </option>
                  <option value={BillDetails.region}>MUMBAI</option>
                  <option value={BillDetails.region}>KHARGHAR</option>
                  <option value={BillDetails.region}>AHMEDABAD</option>
                  <option value={BillDetails.region}>BANGALURU</option>
                  <option value={BillDetails.region}>BHUBANESHWAR</option>
                  <option value={BillDetails.region}>CHANDIGARH</option>
                  <option value={BillDetails.region}>DELHI</option>
                  <option value={BillDetails.region}>NOIDA</option>
                  <option value={BillDetails.region}>NAGPUR</option>
                  <option value={BillDetails.region}>GANSOLI</option>
                  <option value={BillDetails.region}>HOSPITAL</option>
                  <option value={BillDetails.region}>DHULE</option>
                  <option value={BillDetails.region}>SHIRPUR</option>
                  <option value={BillDetails.region}>INDORE</option>
                  <option value={BillDetails.region}>HYDERABAD</option>
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

              <div className="relative mb-[4vh]">
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

              <div className="relative mb-[4vh]">
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
                  value={BillDetails.compliance206}
                  onChange={handleChange}
                >
                  <option value="" selected disabled hidden>
                    Select 206AB Compliance
                  </option>
                  <option value={BillDetails.compliance206}>
                    206AB Check on Website
                  </option>
                  <option value={BillDetails.compliance206}>
                    2024-Specified Person U/S 206AB
                  </option>
                  <option value={BillDetails.compliance206}>
                    2024-Non-Specified Person U/S 206AB
                  </option>
                  <option value={BillDetails.compliance206}>
                    2025-Specified Person U/S 206AB
                  </option>
                  <option value={BillDetails.compliance206}>
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
                  value={BillDetails.panStatus}
                  onChange={handleChange}
                >
                  <option value="" selected disabled hidden>
                    Select PAN Status
                  </option>
                  <option value={BillDetails.panStatus}>
                    PAN operative/N.A
                  </option>
                  <option value={BillDetails.panStatus}>PAN inoperative</option>
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
                  value={BillDetails.poCreated}
                  onChange={handleChange}
                  required
                >
                  <option value={BillDetails.poCreated}>No</option>
                  <option value={BillDetails.poCreated}>Yes</option>
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
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] *:"
                  id="proformaInvAmt"
                  value={billFormData.proformaInvAmt}
                  onChange={handleChange}
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

          <div className="form-section">
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
                  value={BillDetails.currency}
                  onChange={handleChange}
                >
                  <option value="" selected disabled hidden>
                    Select Currency
                  </option>
                  <option value={BillDetails.currency}>INR</option>
                  <option value={BillDetails.currency}>USD</option>
                  <option value={BillDetails.currency}>RMB</option>
                  <option value={BillDetails.currency}>EURO</option>
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
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="dateGivenToQualEng">
                  Date Given to Quality Engineer
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToQualEng"
                  value={billFormData.dateGivenToQualEng}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="nameQualEng">
                  Name of Quality Engineer
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="nameQualEng"
                  value={billFormData.nameQualEng}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="dateGivenToQSforInspect">
                  Date Given to QS for Inspection
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToQSforInspect"
                  value={billFormData.dateGivenToQSforInspect}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="nameQS">
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
            </div>
          </div>

          <div className="ml-[1vw] w-1/2">
            <h1 className="text-[#000B3E] mb-[4.7vh] text-[35px] font-bold">MIGO Details</h1>

            <div>
              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="dateGivenForMigo">
                  Date Given for MIGO
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenForMigo"
                  value={billFormData.dateGivenForMigo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="migoDate">
                  MIGO Date
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="migoDate"
                  value={billFormData.migoDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="migoNo">
                  MIGO No
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="migoNo"
                  value={billFormData.migoNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="migoAmt">
                  MIGO Amount
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="migoAmt"
                  value={billFormData.migoAmt}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="migoDoneBy">
                  MIGO Done By
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="migoDoneBy"
                  value={billFormData.migoDoneBy}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex">
          <div className="w-1/2">
            <h1 className="text-[#000B3E] mb-[4.7vh] text-[35px] font-bold">Transfering Details</h1>

            <div>
              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="invDateReturnSiteOff">
                  Invoice returned to Site Office
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="invDateReturnSiteOff"
                  value={billFormData.invDateReturnSiteOff}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="dateGivenToSiteEng">
                  Date Given to Site Engineer
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToSiteEng"
                  value={billFormData.dateGivenToSiteEng}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="nameSiteEng">
                  Name of Site Engineer
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="nameSiteEng"
                  value={billFormData.nameSiteEng}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="dateGivenToArchi">
                  Date Given to Architech
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToArchi"
                  value={billFormData.dateGivenToArchi}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="nameArchi">
                  Name of Architech
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="nameArchi"
                  value={billFormData.nameArchi}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="dateGivenToSiteIncharge">
                  Date Given - Site Incharge
                </label>
                <input
                  type="date"
                  className="w-3/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointer"
                  id="dateGivenToSiteIncharge"
                  value={billFormData.dateGivenToSiteIncharge}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="nameSiteIncharge">
                  Name - Site Incharge
                </label>
                <input
                  type="text"
                  className="w-5/6 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)]"
                  id="nameSiteIncharge"
                  value={billFormData.nameSiteIncharge}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-[12vh] w-1/2">
            <div className="form-section">
              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="remarksSiteEng">
                  Remarks
                </label>
                <textarea
                  className="w-9/12 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointe"
                  id="remarksSiteEng"
                  value={billFormData.remarksSiteEng}
                  onChange={handleChange}
                  rows={8}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="remarksArchi">
                  Remarks
                </label>
                <textarea
                  className="w-9/12 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointe"
                  id="remarksArchi"
                  value={billFormData.remarksArchi}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="relative mb-[4vh]">
                <label className="absolute left-[1vw] -top-[2vh] px-[0.3vw] text-[15px] font-semibold bg-[rgba(254,247,255,1)] text-[#01073F] pointer-events-none" htmlFor="remarksSiteIncharge">
                  Remarks
                </label>
                <textarea
                  type="text"
                  className="w-9/12 p-[2.2vh_1vw] border border-[#ccc] rounded-[0.4vw] text-[1vw] outline-none transition-colors duration-200 bg-white shadow-[0px_4px_5px_0px_rgba(0,0,0,0.04)] cursor-pointe"
                  id="remarksSiteIncharge"
                  value={billFormData.remarksSiteIncharge}
                  onChange={handleChange}
                  rows={5}
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

export default BillDetailsSISO;
