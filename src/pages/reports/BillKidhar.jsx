import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import Filters from '../../components/Filters';
import ReportBtns from '../../components/ReportBtns';
import ReportGlobalFilter from "../../components/reports/ReportGlobalFilter";
import { useReportGlobalFilter, pickDateFields, pickAmountFields, COUNT } from "../../components/reports/useReportGlobalFilter";
import download from '../../assets/download.svg';
import send from '../../assets/send.svg';
import print from '../../assets/print.svg';
import Cookies from 'js-cookie';
import axios from 'axios';
import { billKidhar } from '../../apis/report.api';
// Used below but never imported - download and print both threw a
// ReferenceError (observations, Report logics: Bill Kidhar).
import { handleExportAllReports } from '../../utils/exportDownloadPrintReports';
const BillKidhar = () => {
    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };
    const availableRegions = JSON.parse(Cookies.get('availableRegions') || '[]');
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("2020-01-01");
    const [fromDate, setFromDate] = useState("2020-01-01");
    const [toDate, setToDate] = useState(getFormattedDate);
    const [regionOptions, setRegionOptions] = useState([]);
    const [region, setRegion] = useState("all");
    const [vendorName, setVendorName] = useState("");
    const [taxInvNo, setTaxInvNo] = useState("");
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
                const res = await axios.get(billKidhar, { params });
                if (seq !== requestSeq.current) return; // a newer request is in flight
                setBills(res.data.report.data);
                setError(null);
            } catch (err) {
                if (seq !== requestSeq.current) return;
                setError("Failed to load data");
            } finally {
                if (seq === requestSeq.current) {
                    setLoading(false);
                    
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [fromDate, toDate, region, vendorName, taxInvNo]);

    const handleTopDownload = async () => {
        console.log("Rep recd at site download clicked");
        // setSelectedRows(bills.map(bill => bill.srNo));
        const result = await handleExportAllReports(filteredBills.map(bill => bill.srNo), filteredBills, columns, visibleColumnFields, titleName, false, { region, fromDate, toDate });
        console.log("Result = " + result.message);
    };

    const handleTopPrint = async () => {
        console.log("Rep recd at site print clicked");
        // if(selectedRows.length === 0){
        //     setSelectedRows(bills.map(bill => bill.srNo));
        // }
        const result = await handleExportAllReports(filteredBills.map(bill => bill.srNo), filteredBills, columns, visibleColumnFields, titleName, true, { region, fromDate, toDate });
        console.log("Result = " + result.message);
    }

    const titleName = "BillKidhar";

    const columns = [
        { field: "srNo", headerName: "Sr. No" },
        { field: "region", headerName: "Region" },
        { field: "vendorNo", headerName: "Vendor No" },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "copAmt", headerName: "COP Amt" },
        { field: "paymentAmt", headerName: "Payment Amt" },
        { field: "paymentDate", headerName: "Date of Payment" },
        { field: "taxInvRecdAtSite", headerName: "Dt Recd at Site" },
        { field: "qsMeasureGiven", headerName: "Dt given QS Measure" },
        { field: "qsCopGiven", headerName: "Dt given QS Prov COP" },
        { field: "pimoReceived", headerName: "Dt recd PIMO" },
        { field: "qsMumbaiGiven", headerName: "Dt given QS Mumbai" },
        { field: "acctsReceived", headerName: "Dt recd Accts" },
    ]
    const visibleColumnFields = ["srNo", "region", "vendorNo", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "copAmt", "paymentAmt", "paymentDate", "taxInvRecdAtSite", "qsMeasureGiven", "qsCopGiven", "pimoReceived", "qsMumbaiGiven", "acctsReceived"]

    // Home-tab search and filter over the rows already fetched (29.09, item 12).
    const globalFilter = useReportGlobalFilter(bills, {
        dateFields: pickDateFields(columns, ["taxInvDate", "paymentDate", "taxInvRecdAtSite", "qsMeasureGiven", "qsCopGiven", "pimoReceived", "qsMumbaiGiven", "acctsReceived"]),
        amountFields: pickAmountFields(columns, ["taxInvAmt", "copAmt", "paymentAmt"]), // 29.09, item 14
        searchFields: visibleColumnFields,
        totals: { count: COUNT, grandTotalTaxAmount: "taxInvAmt" },
    });
    const filteredBills = globalFilter.filteredRows;

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Bill Kidhar Report</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]" onClick={handleTopPrint}>
                            Print
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                        {/* <button className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]">
                            Send to
                            <img src={send} />
                        </button> */}
                    </div>
                </div>

                <Filters
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    region={region}
                    setRegion={setRegion}
                    regionOptions={regionOptions}
                    vendorName={vendorName}
                    setVendorName={setVendorName}
                    taxInvNo={taxInvNo}
                    setTaxInvNo={setTaxInvNo}
                />

                <ReportGlobalFilter {...globalFilter.props} />

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    <table className='w-full border-collapse bg-white'>
                        <thead>
                            <tr>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Region</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vender No</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Invoice No.</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>COP Amt</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Payment Amt</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Date of Payment</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Recd at Site</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt given QS Measure</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt given QS Prov COP</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt recd PIMO</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt given QS Mumbai</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt recd Accts</th>
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
                            ) : filteredBills.filter(bill => !bill.isSubtotal && bill.srNo).length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-4">No invoices found from {fromDate.split("-")[2]}/{fromDate.split("-")[1]}/{fromDate.split("-")[0]} to {toDate.split("-")[2]}/{toDate.split("-")[1]}/{toDate.split("-")[0]}</td>
                                </tr>
                            )
                                : filteredBills
                                    .filter(bill => !bill.isSubtotal && bill.srNo)
                                    .map((bill, index) => (
                                        <tr key={index} className="hover:bg-[#f5f5f5]">
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.srNo}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.region}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.vendorNo}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.vendorName}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.taxInvNo}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvDate}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.copAmt}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.paymentAmt}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.paymentDate}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.taxInvRecdAtSite}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.qsMeasureGiven}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.qsCopGiven}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.pimoReceived}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.qsMumbaiGiven}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.acctsReceived}</td>
                                        </tr>
                                    ))
                            }
                            {filteredBills
                                .filter(bill => bill.isGrandTotal)
                                .map((bill, index) => (
                                    <tr key={index} className='bg-[#f5f5f5] font-semibold'>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>
                                            <strong>Total Count: {bill.count.toLocaleString('en-IN')}</strong>
                                        </td>
                                        <td colSpan={5} className='border border-black'></td>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Grand Total: {bill.grandTotalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                        </td>
                                        <td colSpan={9} className='border border-black'></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default BillKidhar;