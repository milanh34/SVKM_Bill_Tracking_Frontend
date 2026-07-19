import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Filters from "../../components/Filters";
import ReportBtns from '../../components/ReportBtns';
import download from "../../assets/download.svg";
import send from "../../assets/send.svg";
import print from "../../assets/print.svg";
import axios from 'axios';
import { billJourney } from '../../apis/report.api';
// import { handleExportRepBillJourney } from '../../utils/archive/exportExcelReportBillJourney';
import { handleExportAllReports } from '../../utils/exportDownloadPrintReports';
import ChecklistBillJourney from '../checklists/ChecklistBillJourney';
import Cookies from "js-cookie";

const BillJourney = () => {

    const navigate = useNavigate();

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };
    const availableRegions = JSON.parse(Cookies.get('availableRegions') || '[]');
    const [fromDate, setFromDate] = useState("2020-01-01");
    const [toDate, setToDate] = useState(getFormattedDate());
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [vendorName, setVendorName] = useState("");
    const [taxInvNo, setTaxInvNo] = useState("");
    const [region, setRegion] = useState("");
    const [regionOptions, setRegionOptions] = useState([]);

    useEffect(() => {
        setRegionOptions(availableRegions);
        setRegion(availableRegions);
    }, [])
    useEffect(() => {
        const fetchBills = async () => {
            try {
                const params = {
                    startDate: fromDate,
                    endDate: toDate,
                    vendorName: vendorName,
                    taxInvNo: taxInvNo
                };
                if (region != "all" && region != "ALL") {
                    params.region = region;
                }
                const res = await axios.get(billJourney, { params });
                console.log(res.data.report);
                setBills(res.data.report.data);
            } catch (err) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
                setSelectedInvoices([]);
            }
        };
        fetchBills();
    }, [fromDate, toDate, region, vendorName, taxInvNo]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedInvoices(bills.map(b => b.srNo));
        } else {
            setSelectedInvoices([]);
        }
    };

    const handleSelectInvoice = (srNo) => {
        setSelectedInvoices(prev =>
            prev.includes(srNo) ? prev.filter(id => id !== srNo) : [...prev, srNo]
        );
    };

    const handlePrintChecklist = () => {
        if (selectedInvoices.length === 0) return alert("Please select at least one invoice.");
        const selectedBillsData = bills.filter(b => selectedInvoices.includes(b.srNo));
        navigate("/checklist-bill-journey", { state: { selectedRows: selectedInvoices, bills: selectedBillsData } });
    };

    const handleTopDownload = async () => {
        console.log("Rep given to acc dept download clicked");
        // setSelectedRows(bills.map(bill => bill.srNo));
        const result = await handleExportAllReports(bills.map(bill => bill.srNo), bills, columns, visibleColumnFields, titleName, false);
        console.log("Result = " + result.message);
    };

    const handleTopPrint = async () => {
        console.log("Rep given to acc dept print clicked");
        // if(selectedRows.length === 0){
        //     setSelectedRows(bills.map(bill => bill.srNo));
        // }
        const result = await handleExportAllReports(bills.map(bill => bill.srNo), bills, columns, visibleColumnFields, titleName, true);
        console.log("Result = " + result.message);
    }

    const titleName = "Bill Journey";

    const columns = [
        { field: "srNo", headerName: "Sr. No" },
        { field: "region", headerName: "Region" },
        { field: "projectDescription", headerName: "Project Description" },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "invoiceDate", headerName: "Invoice Date" },
        { field: "invoiceAmount", headerName: "Invoice Amount" },
        { field: "billReceivedAtSite", headerName: "Bill Received at Site" },
        { field: "receiptByProjectTeam", headerName: "Receipt By Project Team" },
        { field: "receivedForPO", headerName: "Received for PO" },
        { field: "receiptOfPO", headerName: "Receipt of PO" },
        { field: "billSendForQualityCertification", headerName: "Bill send for Quality Certification" },
        { field: "billSendToQS", headerName: "Bill send to QS" },
        { field: "certifiedByQS", headerName: "Certified by QS" },
        { field: "certifiedByArch", headerName: "Certified by Arch/PMC/SVKM" },
        { field: "billSendToSiteEngineer", headerName: "Bill send to Site Engineer/ Site Incharge" },
        { field: "receiptBySiteProjectDirector", headerName: "Receipt By Site Project Director" },
        { field: "receiptAtMPTP", headerName: "Receipt at MPTP" },
        { field: "certifiedByLPC", headerName: "Certified by LPC Members" },
        { field: "migoDateNo", headerName: "MIGO Date / MIGO No." },
        { field: "billSendToPIMOMumbai", headerName: "Bill Send to PIMO Mumbai" },
        { field: "billReceivedAtPIMOMumbai", headerName: "Bill Received at PIMO Mumbai" },
        { field: "billSendToQSCertification", headerName: "Bill Send to QS Certification" },
        { field: "receivedFromQSWithCOP", headerName: "Received from QS With COP" },
        { field: "givenToITDept", headerName: "Given to I.T. Dept." },
        { field: "receivedBackFromITDept", headerName: "Received Back from I.T.Dept." },
        { field: "sesDateNo", headerName: "SES Date / SES No." },
        { field: "certifiedByProjectDirector", headerName: "Certified by Project DIRECTOR" },
        { field: "certifiedByProjectAdvisor", headerName: "Certified by Project ADVISOR" },
        { field: "certifiedByMCMembers", headerName: "Certified by MC Members" },
        { field: "submittedToAccountsDepartment", headerName: "Submitted to Accounts Department" },
        { field: "delay_for_receiving_invoice", headerName: "Delay for Receiving Invoice" },
        { field: "no_of_Days_Site", headerName: "No. of Days Site" },
        { field: "no_of_Days_at_Mumbai", headerName: "No. of Days at Mumbai" },
        { field: "no_of_Days_at_AC", headerName: "No. of Days at AC" },
        { field: "days_for_payment", headerName: "Days for Payment" }
    ]

    const visibleColumnFields = columns.map(col => col.field);

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />
            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Bill Journey Report</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]" onClick={handlePrintChecklist}>
                            Print Checklist
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]" onClick={handleTopPrint}>
                            Print
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                    </div>
                </div>

                <Filters
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    vendorName={vendorName}
                    setVendorName={setVendorName}
                    taxInvNo={taxInvNo}
                    setTaxInvNo={setTaxInvNo}
                    region={region}
                    setRegion={setRegion}
                    regionOptions={regionOptions}
                    setRegionOptions={setRegionOptions}
                />

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    <table className='w-full border-collapse bg-white whitespace'>
                        <thead>
                            <tr>
                                <th className='sticky left-0 top-0 z-[50] w-12 bg-[#f8f9fa] px-1.5 py-2.5 border border-black'>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedInvoices.length === bills.length && bills.length > 0}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                        {selectedInvoices.length > 0 && (
                                            <span className="text-xs text-gray-500 mt-1">
                                                {selectedInvoices.length}/{bills.length}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                {columns.map((col, idx) => (
                                    <th key={idx} className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>
                                        {col.headerName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4">Loading...</td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4">No bills found from {fromDate.split("-")[2]}/{fromDate.split("-")[1]}/{fromDate.split("-")[0]} to {toDate.split("-")[2]}/{toDate.split("-")[1]}/{toDate.split("-")[0]}</td>
                                </tr>
                            ) : bills.map((bill, index) => (
                                <tr key={index} className="hover:bg-[#f5f5f5]">
                                    <td className={`sticky left-0 z-[20] whitespace-nowrap px-3 py-3 text-center border border-black ${selectedInvoices.includes(bill.srNo) ? 'bg-blue-50' : 'bg-white'}`}>
                                        <div className="relative z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedInvoices.includes(bill.srNo)}
                                                onChange={() => handleSelectInvoice(bill.srNo)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </div>
                                    </td>
                                    {visibleColumnFields.map((field, idx) => (
                                        <td key={idx} className={`border border-black text-[14px] py-[0.75vh] px-[0.65vw] ${['invoiceAmount', 'delay_for_receiving_invoice', 'no_of_Days_Site', 'no_of_Days_at_Mumbai', 'no_of_Days_at_AC', 'days_for_payment'].includes(field) ? 'text-right' : 'text-left'}`}>
                                            {field === 'invoiceAmount' ? bill[field]?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : bill[field]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default BillJourney;
