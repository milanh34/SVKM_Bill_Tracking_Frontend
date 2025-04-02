import React from 'react';
import { useState, useRef } from 'react';
import '../styles/BillDetails.css'
import Header from '../components/Header';
import BillDetails from './BillDetails';
import { bills } from '../apis/bills.api';

const BillDetailsQS = () => {

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

        advDate: "",
        advAmt: "",
        advPrecent: "",
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

        natureOfWork: "others"
    });

    const handleChange = (e) => {
        e.preventDefault();

        let id = e.target.id;
        let val = e.target.value;

        setBillFormData({
            ...billFormData, [id]: val,
        })
    }

    const dateInputRef = useRef(null);

    const handleInputClick = () => {
        dateInputRef.current.focus();
    };

    const handleSubmitForm = () => {
        const requiredFields = [
          'invoiceType',
          'region',
          'projectDesc',
          'vendorName',
          'vendorNo',
          'poCreated',
          'proformaInvRecdDate',
          'taxInvRecdBy',
          'department', 
        ];
        
        const missingFields = requiredFields.filter(field => !billFormData[field]);
        
        if (missingFields.length > 0) {
          alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
          return;
        }
        
        fetch(bills, {
          method: "POST",
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(billFormData)
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
          })
          .catch((error) => {
            console.error("Error submitting form:", error);
          });
      }

    return (
        <div className='outer'>

            <Header />

            <div className='bill-form-container'>

                <div className="bill-details-section">

                    <h1 className="form-title">Bill Details</h1>

                    <div className="form-section">

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="invoiceType">Type of Invoice *</label>
                                <select id="invoiceType" className='form-select' value={BillDetails.invoiceType} onChange={handleChange} required>
                                    <option value="" selected disabled hidden>Select Invoice Type</option>
                                    <option value={BillDetails.invoiceType} >Proforma Invoice</option>
                                    <option value={BillDetails.invoiceType} >Credit Note</option>
                                    <option value={BillDetails.invoiceType} >Advance/LC/BG</option>
                                    <option value={BillDetails.invoiceType} >Direct FI Entry</option>
                                    <option value={BillDetails.invoiceType} >Utility Work</option>
                                    <option value={BillDetails.invoiceType} >Petty cash</option>
                                    <option value={BillDetails.invoiceType} >Hold/Ret Release</option>
                                    <option value={BillDetails.invoiceType} >Imports</option>
                                    <option value={BillDetails.invoiceType} >Equipments</option>
                                    <option value={BillDetails.invoiceType} >Materials</option>
                                    <option value={BillDetails.invoiceType} >IT related</option>
                                    <option value={BillDetails.invoiceType} >IBMS</option>
                                    <option value={BillDetails.invoiceType} >Consultancy bill</option>
                                    <option value={BillDetails.invoiceType} >Civil Works</option>
                                    <option value={BillDetails.invoiceType} >Petrol/Diesel</option>
                                    <option value={BillDetails.invoiceType} >STP Work</option>
                                    <option value={BillDetails.invoiceType} >HVAC Work</option>
                                    <option value={BillDetails.invoiceType} >MEP Work</option>
                                    <option value={BillDetails.invoiceType} >Fire Fighting Work</option>
                                    <option value={BillDetails.invoiceType} >Painting work</option>
                                    <option value={BillDetails.invoiceType} >Site Infra</option>
                                    <option value={BillDetails.invoiceType} >Carpentry</option>
                                    <option value={BillDetails.invoiceType} >Housekeeping/Security</option>
                                    <option value={BillDetails.invoiceType} >Overheads</option>
                                    <option value={BillDetails.invoiceType} >Others</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="region">Region *</label>
                                <select id="region" className='form-select' value={BillDetails.region} onChange={handleChange} required>
                                    <option value="" selected disabled hidden>Select Region</option>
                                    <option value={BillDetails.region} >MUMBAI</option>
                                    <option value={BillDetails.region} >KHARGHAR</option>
                                    <option value={BillDetails.region} >AHMEDABAD</option>
                                    <option value={BillDetails.region} >BANGALURU</option>
                                    <option value={BillDetails.region} >BHUBANESHWAR</option>
                                    <option value={BillDetails.region} >CHANDIGARH</option>
                                    <option value={BillDetails.region} >DELHI</option>
                                    <option value={BillDetails.region} >NOIDA</option>
                                    <option value={BillDetails.region} >NAGPUR</option>
                                    <option value={BillDetails.region} >GANSOLI</option>
                                    <option value={BillDetails.region} >HOSPITAL</option>
                                    <option value={BillDetails.region} >DHULE</option>
                                    <option value={BillDetails.region} >SHIRPUR</option>
                                    <option value={BillDetails.region} >INDORE</option>
                                    <option value={BillDetails.region} >HYDERABAD</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="projectDesc">Project Description *</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="projectDesc"
                                    value={billFormData.projectDesc}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="gstNo">GST Number</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="gstNo"
                                    value={billFormData.gstNo}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="vendorName">Vendor Name *</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="vendorName"
                                    value={billFormData.vendorName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="vendorNo">Vendor No *</label>
                                <input
                                    type="number"
                                    className="form-control bill-input"
                                    id="vendorNo"
                                    value={billFormData.vendorNo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="compliance206">206AB Compliance</label>
                                <select id="compliance206" className='form-select' value={BillDetails.compliance206} onChange={handleChange}>
                                    <option value="" selected disabled hidden>Select 206AB Compliance</option>
                                    <option value={BillDetails.compliance206} >206AB Check on Website</option>
                                    <option value={BillDetails.compliance206} >2024-Specified Person U/S 206AB</option>
                                    <option value={BillDetails.compliance206} >2024-Non-Specified Person U/S 206AB</option>
                                    <option value={BillDetails.compliance206} >2025-Specified Person U/S 206AB</option>
                                    <option value={BillDetails.compliance206} >2025-Non-Specified Person U/S 206AB</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="panStatus">PAN Status</label>
                                <select id="panStatus" className='form-select' value={BillDetails.panStatus} onChange={handleChange}>
                                    <option value="" selected disabled hidden>Select PAN Status</option>
                                    <option value={BillDetails.panStatus} >PAN operative/N.A</option>
                                    <option value={BillDetails.panStatus} >PAN inoperative</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    <div className='form-section'>

                        <div className="form-group">
                            <label className="form-label" htmlFor="poCreated">Is PO already Created? *</label>
                            <select id="poCreated" className='form-select' value={BillDetails.poCreated} onChange={handleChange} required>
                                <option value={BillDetails.poCreated}>No</option>
                                <option value={BillDetails.poCreated}>Yes</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="poNo">PO No.</label>
                                <input
                                    type="number"
                                    className="form-control bill-input"
                                    id="poNo"
                                    value={billFormData.poNo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="poDate">PO Date</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="poDate"
                                    value={billFormData.poDate}
                                    onChange={handleChange}
                                    onClick={handleInputClick}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="poAmt">PO Amount</label>
                            <input
                                type="number"
                                className="form-control bill-input"
                                id="poAmt"
                                value={billFormData.poAmt}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="proformaInvNo">Proforma Invoice No</label>
                                <input
                                    type="number"
                                    className="form-control bill-input"
                                    id="proformaInvNo"
                                    value={billFormData.proformaInvNo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="proformaInvDate">Proforma Inv Date</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="proformaInvDate"
                                    value={billFormData.proformaInvDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="proformaInvAmt">Proforma Invoice Amount</label>
                                <input
                                    type="number"
                                    className="form-control bill-input"
                                    id="proformaInvAmt"
                                    value={billFormData.proformaInvAmt}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="proformaInvRecdDate">Proforma Inv Recd at Site *</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="proformaInvRecdDate"
                                    value={billFormData.proformaInvRecdDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                    </div>

                    <div className="form-section">

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="taxInvNo">Tax Invoice No.</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="taxInvNo"
                                    value={billFormData.taxInvNo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="taxInvDate">Tax Inv Date</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="taxInvDate"
                                    value={billFormData.taxInvDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="upload-container-small">
                            <div className="upload-content">
                                <p className="upload-text">Upload image of the bill</p>
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='50' height='50'%3E%3Crect x='2' y='2' width='20' height='20' fill='none' stroke='%23ccc' stroke-width='2' rx='2'/%3E%3Cpath fill='%23ccc' d='M4 18 L8 12 L12 15 L18 8 L20 10 L20 18 L4 18'/%3E%3Ccircle cx='16' cy='8' r='2' fill='%23ccc'/%3E%3C/svg%3E" alt="Image placeholder" className='upload-icon' />
                            </div>
                            <input
                                type="file"
                                className='form-control form-control-input bill-input'
                                id="billImg"
                                value={billFormData.billImg}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="currency">Currency</label>
                            <select id="currency" className='form-select' value={BillDetails.currency} onChange={handleChange}>
                                <option value="" selected disabled hidden>Select Currency</option>
                                <option value={BillDetails.currency} >INR</option>
                                <option value={BillDetails.currency} >USD</option>
                                <option value={BillDetails.currency} >RMB</option>
                                <option value={BillDetails.currency} >EURO</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="taxInvAmt">Tax Invoice Amount</label>
                            <input
                                type="number"
                                className="form-control bill-input"
                                id="taxInvAmt"
                                value={billFormData.taxInvAmt}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="taxInvRecdBy">Tax Inv Received By *</label>
                            <input
                                type="text"
                                className="form-control bill-input"
                                id="taxInvRecdBy"
                                value={billFormData.taxInvRecdBy}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="department">Department *</label>
                            <input
                                type="text"
                                className="form-control bill-input"
                                id="department"
                                value={billFormData.department}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="remarksSiteTeam">Remarks by Site Team</label>
                            <input
                                type="text"
                                className="form-control bill-input"
                                id="remarksSiteTeam"
                                value={billFormData.remarksSiteTeam}
                                onChange={handleChange}
                            />
                        </div>

                    </div>
                </div>

                <div className="more-details-section">

                    <div className="advanced-bill-section">

                        <h1 className="form-title">Advanced Details</h1>

                        <div className="form-section">
                            <div className="form-group">
                                <label className="form-label" htmlFor="advDate">Advanced Date</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="advDate"
                                    value={billFormData.advDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="advAmt">Advance Amount</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="advAmt"
                                    value={billFormData.advAmt}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="advPercent">Advance Percentage</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="advPercent"
                                    value={billFormData.advPrecent}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="advReqEnteredBy">Advance Request Entered By </label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="advReqEnteredBy"
                                    value={billFormData.advReqEnteredBy}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                    </div>

                    <div className="quality-surveyor-details-section">

                        <h1 className="form-title">Quality Surveyor Details</h1>

                        <div className="form-section">
                            <div className="form-group">
                                <label className="form-label" htmlFor="checkingDate">Date of Checking</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="checkingDate"
                                    value={billFormData.checkingDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="dateGivenToQS">Date Given to QS for Inspection</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="dateGivenToQS"
                                    value={billFormData.dateGivenToQS}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="qsName">Name of QS</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="qsName"
                                    value={billFormData.qsName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="dateGivenToQSforCOP">Date Given to QS for COP</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="dateGivenToQSforCOP"
                                    value={billFormData.dateGivenToQSforCOP}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="copDate">COP Date</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="copDate"
                                    value={billFormData.copDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="copAmt">COP Amount</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="copAmt"
                                    value={billFormData.copAmt}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="remarksQsTeam">Remarks by QS Team</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="remarksQsTeam"
                                    value={billFormData.remarksQsTeam}
                                    onChange={handleChange}
                                />
                            </div>

                        </div>

                    </div>
                </div>


                <div className="extra-section">

                    <div className="form-group">
                        <label className="form-label" htmlFor="dateGivenToQSMum">Date Given to QS Mumbai</label>
                        <input
                            type="date"
                            className="form-control bill-input"
                            id="dateGivenToQSMum"
                            value={billFormData.dateGivenToQSMum}
                            onChange={handleChange}
                            style={{ width: "25%" }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="nameQS">Name of QS</label>
                        <input
                            type="text"
                            className="form-control bill-input"
                            id="nameQS"
                            value={billFormData.nameQS}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="dateGivenToPIMOmum">Date Given to PIMO Mumbai</label>
                        <input
                            type="date"
                            className="form-control bill-input"
                            id="dateGivenToPIMOmum"
                            value={billFormData.dateGivenToPIMOmum}
                            onChange={handleChange}
                            style={{ width: "25%" }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="pimoName">Name - PIMO</label>
                        <input
                            type="text"
                            className="form-control bill-input"
                            id="pimoName"
                            value={billFormData.pimoName}
                            onChange={handleChange}
                        />
                    </div>

                </div>


                <button className="submit-button" type="submit" onClick={handleSubmitForm}>Submit</button>

            </div>

        </div>
    )
}

export default BillDetailsQS