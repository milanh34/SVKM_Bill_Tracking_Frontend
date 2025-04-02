import React from 'react';
import { useState, useRef } from 'react';
import '../styles/BillDetails.css'
import Header from '../components/Header';
import BillDetails from './BillDetails';
import { bills } from '../apis/bills.api';

const BillDetailsSISO = () => {

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
                                {/* <input
                                type="text"
                                className="form-control"
                                id="invoiceType"
                                value={billFormData.invoiceType}
                                onChange={handleChange}
                                required
                            /> */}
                                <select id="invoiceType" className='form-select' value={BillDetails.invoiceType} onChange={handleChange}>
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
                                {/* <input
                                type="text"
                                className="form-control"
                                id="region"
                                value={billFormData.region}
                                onChange={handleChange}
                                required
                            /> */}
                                <select id="region" className='form-select' value={BillDetails.region} onChange={handleChange}>
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
                                    required
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
                                {/* <input
                                type="text"
                                className="form-control"
                                id="compliance206"
                                value={billFormData.compliance206}
                                onChange={handleChange}
                                required
                            /> */}
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
                                {/* <input
                                type="text"
                                className="form-control"
                                id="panStatus"
                                value={billFormData.panStatus}
                                onChange={handleChange}
                                required
                            /> */}
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
                            {/* <input
            type="text"
            className="form-control"
            id="poCreated"
            value={billFormData.poCreated}
            onChange={handleChange}
            required
          /> */}
                            <select id="poCreated" className='form-select' value={BillDetails.poCreated}>
                                <option value={BillDetails.poCreated} onChange={handleChange}>No</option>
                                <option value={BillDetails.poCreated} onChange={handleChange}>Yes</option>
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
                                    required
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
                                    required
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
                                required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                    required
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
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="currency">Currency</label>
                            {/* <input
                            type="text"
                            className="form-control"
                            id="currency"
                            value={billFormData.currency}
                            onChange={handleChange}
                            required
                        /> */}
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
                                required
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
                                required
                            />
                        </div>

                    </div>

                    {/* <div className="form-section form-section-upload">
                        <div className="upload-container-small">
                            <div className="upload-content">
                                <p className="upload-text">Upload image of the bill</p>
                                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='50' height='50'%3E%3Crect x='2' y='2' width='20' height='20' fill='none' stroke='%23ccc' stroke-width='2' rx='2'/%3E%3Cpath fill='%23ccc' d='M4 18 L8 12 L12 15 L18 8 L20 10 L20 18 L4 18'/%3E%3Ccircle cx='16' cy='8' r='2' fill='%23ccc'/%3E%3C/svg%3E" alt="Image placeholder" className='upload-icon' />
                            </div>
                            <input
                                type="file"
                                className='form-control form-control-input'
                                id="billImg"
                                value={billFormData.billImg}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div> */}
                </div>

                <div className="more-details-section">

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
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="dateGivenToQualEng">Date Given to Quality Engineer</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="dateGivenToQualEng"
                                    value={billFormData.dateGivenToQualEng}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="nameQualEng">Name of Quality Engineer</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="nameQualEng"
                                    value={billFormData.nameQualEng}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="dateGivenToQSforInspect">Date Given to QS for Inspection</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="dateGivenToQSforInspect"
                                    value={billFormData.dateGivenToQSforInspect}
                                    onChange={handleChange}
                                    required
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
                                    required
                                />
                            </div>

                        </div>

                    </div>

                    <div className="migo-details-section">

                        <h1 className="form-title">MIGO Details</h1>

                        <div className="form-section">
                            <div className="form-group">
                                <label className="form-label" htmlFor="dateGivenForMigo">Date Given for MIGO</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="dateGivenForMigo"
                                    value={billFormData.dateGivenForMigo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="migoDate">MIGO Date</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="migoDate"
                                    value={billFormData.migoDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="migoNo">MIGO No</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="migoNo"
                                    value={billFormData.migoNo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="migoAmt">MIGO Amount</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="migoAmt"
                                    value={billFormData.migoAmt}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="migoDoneBy">MIGO Done By</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="migoDoneBy"
                                    value={billFormData.migoDoneBy}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                    </div>

                </div>

                <div className="transfer-details-main-section">

                    <div className="transfering-details-section">

                        <h1 className="form-title">Transfering Details</h1>

                        <div className="form-section">
                            <div className="form-group">
                                <label className="form-label" htmlFor="invDateReturnSiteOff">Invoice returned to Site Office</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="invDateReturnSiteOff"
                                    value={billFormData.invDateReturnSiteOff}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="dateGivenToSiteEng">Date Given to Site Engineer</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="dateGivenToSiteEng"
                                    value={billFormData.dateGivenToSiteEng}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="nameSiteEng">Name of Site Engineer</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="nameSiteEng"
                                    value={billFormData.nameSiteEng}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="dateGivenToArchi">Date Given to Architech</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="dateGivenToArchi"
                                    value={billFormData.dateGivenToArchi}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="nameArchi">Name of Architech</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="nameArchi"
                                    value={billFormData.nameArchi}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="dateGivenToSiteIncharge">Date Given - Site Incharge</label>
                                <input
                                    type="date"
                                    className="form-control bill-input"
                                    id="dateGivenToSiteIncharge"
                                    value={billFormData.dateGivenToSiteIncharge}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="nameSiteIncharge">Name - Site Incharge</label>
                                <input
                                    type="text"
                                    className="form-control bill-input"
                                    id="nameSiteIncharge"
                                    value={billFormData.nameSiteIncharge}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>

                    </div>

                    <div className="remarks-section">

                        <div className="form-section">
                            <div className="form-group">
                                <label className="form-label" htmlFor="remarksSiteEng">Remarks</label>
                                <textarea
                                    className="form-control"
                                    id="remarksSiteEng"
                                    value={billFormData.remarksSiteEng}
                                    onChange={handleChange}
                                    rows={8}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="remarksArchi">Remarks</label>
                                <textarea
                                    className="form-control"
                                    id="remarksArchi"
                                    value={billFormData.remarksArchi}
                                    onChange={handleChange}
                                    rows={5}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="remarksSiteIncharge">Remarks</label>
                                <textarea
                                    type="text"
                                    className="form-control"
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


                <button className="submit-button" type="submit" onClick={handleSubmitForm}>Submit</button>

            </div>

        </div>
    )
}

export default BillDetailsSISO