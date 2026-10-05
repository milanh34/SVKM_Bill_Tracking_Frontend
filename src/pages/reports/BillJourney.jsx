import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Filters from "../../components/Filters";
import ReportBtns from '../../components/ReportBtns';
import ReportGlobalFilter from "../../components/reports/ReportGlobalFilter";
import { useReportGlobalFilter, pickDateFields, pickAmountFields } from "../../components/reports/useReportGlobalFilter";
import download from "../../assets/download.svg";
import send from "../../assets/send.svg";
import print from "../../assets/print.svg";
import axios from 'axios';
import { billJourney } from '../../apis/report.api';
// import { handleExportRepBillJourney } from '../../utils/archive/exportExcelReportBillJourney';
import { handleExportAllReports } from '../../utils/exportDownloadPrintReports';
import { printBillJourney } from '../../utils/printBillJourney';
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
    // Default window 01-04-2020 to today, on Dt recd at Site (1.10, item O-02).
    const [fromDate, setFromDate] = useState("2020-04-01");
    const [toDate, setToDate] = useState(getFormattedDate());
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    // Declared because the fetch below calls setError. It never was, so a
    // failed request threw a ReferenceError inside its own catch and the page
    // silently kept the previous results.
    const [error, setError] = useState(null);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [vendorName, setVendorName] = useState("");
    const [taxInvNo, setTaxInvNo] = useState("");
    const [region, setRegion] = useState("all");
    const [regionOptions, setRegionOptions] = useState([]);

    useEffect(() => {
        setRegionOptions(availableRegions);
    }, [])

    /**
     * Refetch when a filter changes.
     *
     * Two things were wrong here.
     *
     * The vendor name and tax invoice number are typed, so every keystroke
     * fired its own request. Responses came back in whatever order the
     * network delivered them, and the last one to arrive won - so clearing
     * the vendor name could leave the screen showing the result of an
     * earlier, narrower query. That is what "clearing the vendor filter
     * does not restore all bills" was (observations, Reports R98). Each
     * request now carries a sequence number and only the newest is allowed
     * to set state, and typing is debounced so most of them are never sent.
     *
     * Separately, `region` was initialised to the user's whole region ARRAY
     * while the dropdown still read "All Regions". The server kept only the
     * first entry, so a user with more than one region silently saw one.
     * The dropdown's own "all" value is the initial state instead.
     */
    const requestSeq = useRef(0);

    useEffect(() => {
        const seq = ++requestSeq.current;
        const timer = setTimeout(async () => {
            try {
                const params = {
                    startDate: fromDate,
                    endDate: toDate,
                    vendorName: vendorName,
                    taxInvNo: taxInvNo
                };
                if (region && region !== "all" && region !== "ALL") {
                    params.region = region;
                }
                const res = await axios.get(billJourney, { params });
                if (seq !== requestSeq.current) return; // a newer request is in flight
                setBills(res.data.report.data);
                setError(null);
            } catch (err) {
                if (seq !== requestSeq.current) return;
                setError("Failed to load data");
            } finally {
                if (seq === requestSeq.current) {
                    setLoading(false);
                    setSelectedInvoices([]);
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [fromDate, toDate, region, vendorName, taxInvNo]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedInvoices(filteredBills.map(b => b.srNo));
        } else {
            setSelectedInvoices([]);
        }
    };

    const handleSelectInvoice = (srNo) => {
        setSelectedInvoices(prev =>
            prev.includes(srNo) ? prev.filter(id => id !== srNo) : [...prev, srNo]
        );
    };

    /*
     * "Print Bill Journey" (1.10, item O-17). It used to open the bill
     * checklist page, whose step table is a fixed list of labels: only
     * "Bill Received at Site" was ever given a value (from a key these rows
     * do not use for it), every other date and every name cell was hard-coded
     * blank, and its labels do not match the report's columns. The journey
     * now prints from the rows the report already holds, one page per bill,
     * every step with its date, name and amount.
     */
    const handlePrintBillJourney = () => {
        if (selectedInvoices.length === 0) return alert("Please select at least one invoice.");
        const selectedBillsData = filteredBills.filter(b => !b.isGrandTotal && selectedInvoices.includes(b.srNo));
        printBillJourney(selectedBillsData);
    };

    const handleTopDownload = async () => {
        console.log("Rep given to acc dept download clicked");
        // setSelectedRows(bills.map(bill => bill.srNo));
        // Honour the tick boxes. Previously every bill was exported however few
        // were selected (observations, Report logics: Bill Journey).
        const chosen = selectedInvoices.length
            ? filteredBills.filter(b => selectedInvoices.includes(b.srNo))
            : filteredBills;
        const result = await handleExportAllReports(chosen.map(bill => bill.srNo), chosen, columns, visibleColumnFields, titleName, false, { region, fromDate, toDate });
        console.log("Result = " + result.message);
    };

    const handleTopPrint = async () => {
        console.log("Rep given to acc dept print clicked");
        // if(selectedRows.length === 0){
        //     setSelectedRows(bills.map(bill => bill.srNo));
        // }
        const chosen = selectedInvoices.length
            ? filteredBills.filter(b => selectedInvoices.includes(b.srNo))
            : filteredBills;
        const result = await handleExportAllReports(chosen.map(bill => bill.srNo), chosen, columns, visibleColumnFields, titleName, true, { region, fromDate, toDate });
        console.log("Result = " + result.message);
    }

    const titleName = "Bill Journey";

    /*
     * Ordered as the client's own "Bill Journey report.xlsx" lays the sheet
     * out: the header block, then each journey step with the Name and Amount
     * her layout puts beside it. Those Name and Amount columns were missing
     * altogether, which is most of what "columns filled are not fetched"
     * meant (observation N-10).
     */
    const columns = [
        { field: "srNo", headerName: "Sr. No" },
        { field: "region", headerName: "Region" },
        { field: "projectDescription", headerName: "Project Description" },
        { field: "natureOfWork", headerName: "Nature of Work" },
        { field: "vendorNo", headerName: "Vendor Code" },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "taxInvNo", headerName: "Invoice No" },
        { field: "invoiceDate", headerName: "Invoice Date" },
        { field: "invoiceAmount", headerName: "Invoice Amount" },
        { field: "proformaInvNo", headerName: "Proforma Invoice No" },
        { field: "proformaInvDate", headerName: "Proforma Invoice Dt" },
        { field: "proformaInvAmt", headerName: "Proforma Invoice Amt" },
        { field: "poNo", headerName: "PO No" },
        { field: "poDate", headerName: "PO Dt" },
        { field: "poAmt", headerName: "PO Amt" },
        { field: "copAmt", headerName: "COP Amt" },
        { field: "paymentAmt", headerName: "Payment Amt" },
        { field: "paymentDate", headerName: "Date of Payment" },
        { field: "status", headerName: "Payment Status" },

        { field: "siteApprovalDate", headerName: "Dt given-Site Approval" },
        { field: "billReceivedAtSite", headerName: "Bill Received at Site" },
        { field: "billReceivedAtSiteName", headerName: "Bill Received at Site - Name" },
        { field: "billSendForQualityCertification", headerName: "Bill send for Quality Certification" },
        { field: "billSendForQualityCertificationName", headerName: "Quality Certification - Name" },
        { field: "billSendToQS", headerName: "Bill send to QS" },
        { field: "billSendToQSName", headerName: "Bill send to QS - Name" },
        { field: "certifiedByQS", headerName: "Certified by QS" },
        { field: "certifiedByQSAmount", headerName: "Certified by QS - Amount" },
        { field: "certifiedByArch", headerName: "Certified by Arch/PMC/SVKM" },
        { field: "certifiedByArchName", headerName: "Certified by Arch/PMC/SVKM - Name" },
        { field: "billSendToSiteEngineer", headerName: "Bill send to Site Engineer/ Site Incharge" },
        { field: "billSendToSiteEngineerName", headerName: "Site Engineer/ Site Incharge - Name" },
        { field: "migoDate", headerName: "MIGO Date" },
        { field: "migoDoneBy", headerName: "MIGO done by" },
        { field: "migoAmount", headerName: "MIGO Amt" },
        { field: "billSendToPIMOMumbai", headerName: "Bill Send to PIMO Mumbai" },
        { field: "billReceivedAtPIMOMumbai", headerName: "Bill Received at PIMO Mumbai" },
        { field: "billReceivedAtPIMOMumbaiName", headerName: "Received at PIMO Mumbai - Name" },
        { field: "billSendToQSCertification", headerName: "Bill Send to QS Certification" },
        { field: "billSendToQSCertificationName", headerName: "QS Certification - Name" },
        { field: "receivedFromQSWithCOP", headerName: "Received from QS With COP" },
        { field: "receivedFromQSWithCOPName", headerName: "Received from QS With COP - Name" },
        { field: "receivedFromQSWithCOPAmount", headerName: "Received from QS With COP - Amount" },
        { field: "givenToITDept", headerName: "Given to I.T. Dept." },
        { field: "givenToITDeptName", headerName: "Given to I.T. Dept. - Name" },
        { field: "receivedBackFromITDept", headerName: "Received Back from I.T.Dept." },
        { field: "receivedBackFromITDeptName", headerName: "Received Back from I.T.Dept. - Name" },
        { field: "sesDate", headerName: "SES Date" },
        { field: "sesDoneBy", headerName: "SES done by" },
        { field: "sesAmount", headerName: "SES Amt" },
        { field: "certifiedByProjectDirector", headerName: "Certified by Trustee, Adviser & Director" },
        { field: "submittedToAccountsDepartment", headerName: "Submitted to Accounts Department" },
        { field: "submittedToAccountsDepartmentName", headerName: "Submitted to Accounts - Name" },
        { field: "receivedInAccountsDepartment", headerName: "Received in Accounts Department" },
        { field: "receivedInAccountsDepartmentName", headerName: "Received in Accounts - Name" },

        { field: "delay_for_receiving_invoice", headerName: "Delay for Receiving Invoice" },
        { field: "no_of_Days_Site", headerName: "No. of Days Site" },
        { field: "no_of_Days_at_Mumbai", headerName: "No. of Days at Mumbai" },
        { field: "no_of_Days_at_AC", headerName: "No. of Days at AC" },
        { field: "days_for_payment", headerName: "Days for Payment" }
    ]

    const visibleColumnFields = columns.map(col => col.field);

    // Home-tab search and filter over the rows already fetched (29.09, item 12).
    const globalFilter = useReportGlobalFilter(bills, {
        // Bill Received at Site (col 24) first: the report's own date column (1.10, item O-02).
        dateFields: pickDateFields(columns, [
            "billReceivedAtSite", "invoiceDate", "proformaInvDate", "poDate", "paymentDate", "siteApprovalDate",
            "billSendForQualityCertification", "billSendToQS", "certifiedByQS",
            "certifiedByArch", "billSendToSiteEngineer", "migoDate", "billSendToPIMOMumbai",
            "billReceivedAtPIMOMumbai", "billSendToQSCertification", "receivedFromQSWithCOP",
            "givenToITDept", "receivedBackFromITDept", "sesDate", "certifiedByProjectDirector",
            "submittedToAccountsDepartment", "receivedInAccountsDepartment",
        ]),
        amountFields: pickAmountFields(columns, ["invoiceAmount", "proformaInvAmt", "poAmt", "copAmt", "paymentAmt", "certifiedByQSAmount", "migoAmount", "receivedFromQSWithCOPAmount", "sesAmount"]), // 29.09, item 14
        searchFields: visibleColumnFields,
    });
    const filteredBills = globalFilter.filteredRows;

    // Ticks on rows the filter hides would still be printed; start afresh.
    useEffect(() => {
        setSelectedInvoices([]);
    }, [globalFilter.filterKey]);

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />
            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Bill Journey Report</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]" onClick={handlePrintBillJourney}>
                            Print Bill Journey
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

                <ReportGlobalFilter {...globalFilter.props} />

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    <table className='w-full border-collapse bg-white whitespace'>
                        <thead>
                            <tr>
                                <th className='sticky left-0 top-0 z-[50] w-12 bg-[#f8f9fa] px-1.5 py-2.5 border border-black'>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedInvoices.length === filteredBills.length && filteredBills.length > 0}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                        {selectedInvoices.length > 0 && (
                                            <span className="text-xs text-gray-500 mt-1">
                                                {selectedInvoices.length}/{filteredBills.length}
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
                            ) : error ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4 text-red-600">{error}</td>
                                </tr>
                            ) : filteredBills.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4">No bills found from {fromDate.split("-")[2]}/{fromDate.split("-")[1]}/{fromDate.split("-")[0]} to {toDate.split("-")[2]}/{toDate.split("-")[1]}/{toDate.split("-")[0]}</td>
                                </tr>
                            ) : filteredBills.map((bill, index) => (
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
