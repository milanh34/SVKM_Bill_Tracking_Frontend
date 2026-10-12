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
     * Exactly the list and order of her mail of 6 October (6.10, item 3);
     * the trailing comment is the column-register number. COP Amt and
     * "Received from QS With COP - Amount" are dropped. Pairs the report
     * used to merge (35/40, 51/55) are separate columns. Headings are kept
     * unique because the print exporter keys each cell by its heading, so
     * the col 40/41 pair carries "(Prov COP)" and 51/52 vs 55/56 name the
     * Site Engineer and Site Incharge columns they read.
     */
    const columns = [
        { field: "srNo", headerName: "Sr. No" },                                                    // 1
        { field: "createdBy", headerName: "Created by" },                                           // 2
        { field: "natureOfWork", headerName: "Nature of Work" },                                    // 3
        { field: "region", headerName: "Region" },                                                  // 4
        { field: "projectDescription", headerName: "Project Description" },                         // 5
        { field: "vendorNo", headerName: "Vendor Code" },                                           // 6
        { field: "vendorName", headerName: "Vendor Name" },                                         // 7
        { field: "gstNumber", headerName: "GST No" },                                               // 8
        { field: "compliance206AB", headerName: "206AB Compliance" },                               // 9
        { field: "panStatus", headerName: "PAN Status" },                                           // 10
        { field: "poNo", headerName: "PO No" },                                                     // 12
        { field: "poDate", headerName: "PO Dt" },                                                   // 13
        { field: "poAmt", headerName: "PO Amt" },                                                   // 14
        { field: "proformaInvNo", headerName: "Proforma Invoice No" },                              // 15
        { field: "proformaInvDate", headerName: "Proforma Invoice Dt" },                            // 16
        { field: "proformaInvAmt", headerName: "Proforma Invoice Amt" },                            // 17
        { field: "proformaInvRecdAtSite", headerName: "Proforma Inv Recd at site" },                // 18
        { field: "taxInvNo", headerName: "Invoice No" },                                            // 20
        { field: "invoiceDate", headerName: "Invoice Date" },                                       // 21
        { field: "currency", headerName: "Currency" },                                              // 22
        { field: "invoiceAmount", headerName: "Invoice Amount" },                                   // 23
        { field: "billReceivedAtSite", headerName: "Bill Received at Site" },                       // 24
        { field: "billReceivedAtSiteName", headerName: "Bill Received at Site - Name" },             // 25
        { field: "advanceDate", headerName: "Advance Dt" },                                         // 29
        { field: "advanceAmt", headerName: "Advance Amt" },                                         // 30
        { field: "billSendForQualityCertification", headerName: "Bill send for Quality Certification" }, // 33
        { field: "billSendForQualityCertificationName", headerName: "Quality Certification - Name" }, // 34
        { field: "qsMeasureGivenDate", headerName: "Bill send to QS" },                             // 35
        { field: "qsMeasureGivenName", headerName: "Bill send to QS - Name" },                      // 36
        { field: "qsMeasureCheckedDate", headerName: "Dt Checked by QS with Measure" },              // 37
        { field: "qsMeasureReturnedDate", headerName: "Dt ret-QS aft measure" },                    // 38
        { field: "qsProvCopGivenDate", headerName: "Bill send to QS (Prov COP)" },                  // 40
        { field: "qsProvCopGivenName", headerName: "Bill send to QS - Name (Prov COP)" },           // 41
        { field: "certifiedByQS", headerName: "Certified by QS" },                                  // 42
        { field: "certifiedByQSAmount", headerName: "Certified by QS - Amount" },                   // 43
        { field: "qsProvCopReturnedDate", headerName: "Dt ret-QS aft Prov COP" },                   // 44A
        { field: "migoGivenDate", headerName: "Dt given-MIGO" },                                    // 45
        { field: "migoNo", headerName: "MIGO no" },                                                 // 46
        { field: "migoDate", headerName: "MIGO Date" },                                             // 47
        { field: "migoAmount", headerName: "MIGO Amt" },                                            // 48
        { field: "migoDoneBy", headerName: "MIGO done by" },                                        // 49
        { field: "invReturnedToSiteDate", headerName: "Dt-ret aft MIGO to Site" },                  // 50
        { field: "siteEngineerGivenDate", headerName: "Bill send to Site Engineer" },               // 51
        { field: "siteEngineerGivenName", headerName: "Site Engineer - Name" },                     // 52
        { field: "certifiedByArch", headerName: "Certified by Arch/PMC/SVKM" },                      // 53
        { field: "certifiedByArchName", headerName: "Certified by Arch/PMC/SVKM - Name" },           // 54
        { field: "siteInchargeGivenDate", headerName: "Bill send to Site Incharge" },               // 55
        { field: "siteInchargeGivenName", headerName: "Site Incharge - Name" },                     // 56
        { field: "remarksAtSite", headerName: "Remarks at site" },                                  // 57
        { field: "siteApprovalDate", headerName: "Site Trustee/LPC" },                              // 58, was "Dt given-Site Approval"
        { field: "siteStatus", headerName: "Status at Site" },                                      // 60
        { field: "billSendToPIMOMumbai", headerName: "Bill Send to PIMO Mumbai" },                  // 61
        { field: "billReceivedAtPIMOMumbai", headerName: "Bill Received at PIMO Mumbai" },          // 62
        { field: "billReceivedAtPIMOMumbaiName", headerName: "Received at PIMO Mumbai - Name" },     // 63
        { field: "billSendToQSCertification", headerName: "Bill Send to QS Certification" },        // 64
        { field: "billSendToQSCertificationName", headerName: "QS Certification - Name" },          // 65
        { field: "receivedFromQSWithCOP", headerName: "Received from QS With COP" },                // 66
        { field: "receivedFromQSWithCOPName", headerName: "Received from QS With COP - Name" },     // 67
        { field: "givenToITDept", headerName: "Given to I.T. Dept." },                              // 68
        { field: "givenToITDeptName", headerName: "Given to I.T. Dept. - Name" },                   // 69
        { field: "sesGivenDate", headerName: "Dt given-PIMO for SES" },                             // 70
        { field: "sesNo", headerName: "SES no" },                                                   // 72
        { field: "sesAmount", headerName: "SES Amt" },                                              // 73
        { field: "sesDate", headerName: "SES Date" },                                               // 74
        { field: "sesDoneBy", headerName: "SES done by" },                                          // 74A
        { field: "receivedBackFromITDept", headerName: "Dt ret-IT Dept aft SES" },                  // 75
        { field: "pimoReturnedAfterSesDate", headerName: "Dt ret-PIMO aft SES" },                   // 76
        { field: "trusteeApprovalDate", headerName: "Certified by Trustee, Adviser & Director" },   // 77
        { field: "certifiedByProjectDirector", headerName: "Dt ret-PIMO aft approval" },            // 78
        { field: "submittedToAccountsDepartment", headerName: "Submitted to Accounts Department" }, // 80
        { field: "submittedToAccountsDepartmentName", headerName: "Submitted to Accounts - Name" }, // 81
        { field: "receivedInAccountsDepartment", headerName: "Received in Accounts Department" },   // 82
        { field: "receivedInAccountsDepartmentName", headerName: "Received in Accounts - Name" },   // 82A
        { field: "acctsReturnedToPimoDate", headerName: "Dt ret-PIMO by Accts" },                   // 83
        { field: "acctsReceivedBackDate", headerName: "Dt recd back in Accts" },                    // 84
        { field: "bookingGivenDate", headerName: "Dt given-booking" },                              // 85
        { field: "paymentInstructions", headerName: "Payment instructions" },                       // 86
        { field: "f110Identification", headerName: "F110" },                                        // 88
        { field: "paymentDate", headerName: "Date of Payment" },                                    // 89
        { field: "accountsIdentification", headerName: "Accts Identification" },                    // 90
        { field: "paymentAmt", headerName: "Payment Amt" },                                         // 91
        { field: "status", headerName: "Payment Status" },                                          // 93
        { field: "miroNo", headerName: "MIRO no" },                                                 // 94
        { field: "miroDate", headerName: "MIRO Dt" },                                               // 95
        { field: "miroAmount", headerName: "MIRO Amt" },                                            // 96

        // Formula columns, computed by the server (6.10, item 3).
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
            "billReceivedAtSite", "invoiceDate", "proformaInvDate", "poDate", "paymentDate",
            "proformaInvRecdAtSite", "advanceDate", "billSendForQualityCertification",
            "qsMeasureGivenDate", "qsMeasureCheckedDate", "qsMeasureReturnedDate",
            "qsProvCopGivenDate", "certifiedByQS", "qsProvCopReturnedDate", "migoGivenDate",
            "migoDate", "invReturnedToSiteDate", "siteEngineerGivenDate", "certifiedByArch",
            "siteInchargeGivenDate", "siteApprovalDate", "billSendToPIMOMumbai",
            "billReceivedAtPIMOMumbai", "billSendToQSCertification", "receivedFromQSWithCOP",
            "givenToITDept", "sesGivenDate", "sesDate", "receivedBackFromITDept",
            "pimoReturnedAfterSesDate", "trusteeApprovalDate", "certifiedByProjectDirector",
            "submittedToAccountsDepartment", "receivedInAccountsDepartment",
            "acctsReturnedToPimoDate", "acctsReceivedBackDate", "bookingGivenDate", "miroDate",
        ]),
        amountFields: pickAmountFields(columns, ["invoiceAmount", "proformaInvAmt", "poAmt", "advanceAmt", "certifiedByQSAmount", "migoAmount", "sesAmount", "paymentAmt", "miroAmount"]), // 29.09, item 14
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
                                {/* Checkbox and Sr No stay put when scrolling right (6.10, item 4). */}
                                <th className='sticky left-0 top-0 z-[50] w-[3.5rem] min-w-[3.5rem] max-w-[3.5rem] bg-[#f8f9fa] px-1.5 py-2.5 border border-black'>
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
                                    <th key={idx} className={`sticky top-0 ${col.field === 'srNo' ? 'left-[3.5rem] z-[50] shadow-[1px_0_0_#000]' : 'z-[1]'} border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left`}>
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
                                    <td className={`sticky left-0 z-[20] w-[3.5rem] min-w-[3.5rem] max-w-[3.5rem] whitespace-nowrap px-3 py-3 text-center border border-black ${selectedInvoices.includes(bill.srNo) ? 'bg-blue-50' : 'bg-white'}`}>
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
                                        <td key={idx} className={`border border-black text-[14px] py-[0.75vh] px-[0.65vw] ${field === 'srNo' ? `sticky left-[3.5rem] z-[20] shadow-[1px_0_0_#000] ${selectedInvoices.includes(bill.srNo) ? 'bg-blue-50' : 'bg-white'}` : ''} ${['invoiceAmount', 'delay_for_receiving_invoice', 'no_of_Days_Site', 'no_of_Days_at_Mumbai', 'no_of_Days_at_AC', 'days_for_payment'].includes(field) ? 'text-right' : 'text-left'}`}>
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
