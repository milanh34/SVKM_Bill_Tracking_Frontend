import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { report } from "../apis/bills.api";
import { receivedAtSite } from '../apis/report.api';
import Header from "../components/Header";
import Filters from "../components/Filters";
import ReportBtns from '../components/ReportBtns';
import SendBox from "../components/Sendbox";
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";
import Cookies from "js-cookie";
import { handleExportRepRecdAtSite } from '../utils/exportExcelReportRecdSite';
import { handleExportAllReports } from '../utils/exportDownloadPrintReports';

const RepRecAtSite = () => {

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (Cookies.get("userRole") === null) {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await axios.get(`${receivedAtSite}?startDate=${fromDate}&endDate=${toDate}`);
                console.log(response.data.report);
                setBills(response.data.report.data);
                // await setSelectedRows(bills.map(bill => bill.srNo));
            } catch (error) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, [fromDate, toDate]);

    // useEffect(() => {
    //     if (selectAll) {
    //         setSelectedRows(bills.map(bill => bill.srNo));
    //     }
    // }, [bills, selectAll]);

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        setSelectedRows(selectAll ? [] : bills.map(bill => bill.srNo));
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(rowId => rowId !== id)
                : [...prevSelected, id]
        );
    };

    const handleTopDownload = async () => {
        console.log("Rep recd at site download clicked");
        // setSelectedRows(bills.map(bill => bill.srNo));
        const result = await handleExportAllReports(bills.map(bill => bill.srNo), bills, columns, visibleColumnFields, titleName, false);
        console.log("Result = " + result.message);
    };

    const handleTopPrint = async () => {
        console.log("Rep recd at site print clicked");
        // if(selectedRows.length === 0){
        //     setSelectedRows(bills.map(bill => bill.srNo));
        // }
        const result = await handleExportAllReports(bills.map(bill => bill.srNo), bills, columns, visibleColumnFields, titleName, true);
        console.log("Result = " + result.message);
    }

    const titleName = "Invoices Received at Site";

    const columns = [
        // { field: "copAmt", headerName: "COP Amount" },
        { field: "srNo", headerName: "Sr. No" },
        { field: "projectDescription", headerName: "Project Description" },
        { field: "vendorName", headerName: "Vendor Name" },
        // { field: "vendorNo", headerName: "Vendor No." },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "dtTaxInvRecdAtSite", headerName: "Dt Tax Inv recd at Site" },
        { field: "poNo", headerName: "PO No" }
    ]

    const visibleColumnFields = [
        "srNo", "projectDescription", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "dtTaxInvRecdAtSite", "poNo"
    ]

    const handleSendClick = () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one bill to send.");
            return;
        }
        setIsModalOpen(true);
    };

    const isWithinDateRange = (dateString) => {
        if (!dateString) return true;
        if (!fromDate && !toDate) return true;

        const date = new Date(dateString.split("T")[0]);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (from) from.setHours(0, 0, 0, 0);
        if (to) to.setHours(23, 59, 59, 999);

        if (from && to) return date >= from && date <= to;
        else if (from) return date >= from;
        else if (to) return date <= to;

        return true;
    };

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Invoices Received At Site</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]" onClick={handleTopPrint}>
                            Print
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                        {/* <button className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]" onClick={handleSendClick}>
                            Send to
                            <img src={send} />
                        </button> */}
                    </div>
                </div>

                <Filters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                />

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    <table className='w-full border-collapse bg-white'>
                        <thead>
                            <tr>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Project Description</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv no</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Tax Inv recd at Site</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>PO No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">Loading...</td>
                                </tr>
                            ) 
                            // : bills.length === 0 ? (
                            //     <tr>
                            //         <td colSpan="9" className="text-center py-4">No invoices found from {fromDate.split("-")[2]}/{fromDate.split("-")[1]}/{fromDate.split("-")[0]} to {toDate.split("-")[2]}/{toDate.split("-")[1]}/{toDate.split("-")[0]}</td>
                            //     </tr>
                            // ) 
                            : bills
                                .filter(bill => !bill.isSubtotal && bill.srNo)
                                .map((bill, index) => (
                                    <tr key={bill.srNo} className="hover:bg-[#f5f5f5]">
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.srNo}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.projectDescription}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.vendorName}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.taxInvNo}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvDate}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.dtTaxInvRecdAtSite}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.poNo}</td>
                                    </tr>
                                ))
                            }
                            {bills
                                .filter(bill => bill.isGrandTotal)
                                .map((bill) => (
                                    <tr key={bill.totalCount} className='bg-[#f5f5f5] font-semibold'>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Total Count: {bill.totalCount.toLocaleString('en-IN')}</strong>
                                        </td>
                                        <td colSpan={4} className='border border-black'></td>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Grand Total: {bill.grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                        </td>
                                        <td colSpan={2} className='border border-black'></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <SendBox
                        closeWindow={() => setIsModalOpen(false)}
                        selectedBills={selectedRows}
                        bills={bills}
                    />
                </div>
            )}
        </div>
    )
}

export default RepRecAtSite;