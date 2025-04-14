import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { outstanding } from '../apis/report.api.js';
import { handleExportOutstandingSubtotalReport } from "../utils/exportExcelReportOutstandingSubtotal.js";
import Header from '../components/Header.jsx';
import Filters from "../components/Filters.jsx";
import ReportBtns from '../components/ReportBtns.jsx';
import download from "../assets/download.svg";
import print from "../assets/print.svg";

const RepBillOutstandingSubtotal = () => {

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const [billsData, setBillsData] = useState([]);
    const [totals, setTotals] = useState({
        totalSubtotal: 0,
        totalSubtotalCopAmt: 0,
        totalVendorCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await axios.get(`${outstanding}?startDate=${fromDate}&endDate=${toDate}`);
                setBillsData(response.data.report.data);
                
                const grandTotal = response.data.report.data.find(item => item.isGrandTotal);
                if (grandTotal) {
                    setTotals({
                        totalSubtotal: grandTotal.grandTotalAmount,
                        totalSubtotalCopAmt: grandTotal.grandTotalCopAmt,
                        totalVendorCount: grandTotal.totalCount
                    });
                }
            } catch (error) {
                setError("Failed to load data");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, [fromDate, toDate]);

    // const handleSelectAll = (e) => {
    //     if (e.target.checked) {
    //         const allRows = billsData.flatMap(group => group.billdets.map(bill => bill._id));
    //         setSelectedRows(allRows);
    //     } else {
    //         setSelectedRows([]);
    //     }
    // };

    // const handleSelectRow = (e, id) => {
    //     if (e.target.checked) {
    //         setSelectedRows(prev => [...prev, id]);
    //     } else {
    //         setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    //     }
    // };

    // const isWithinDateRange = (date) => {
    //     const from = new Date(fromDate);
    //     const to = new Date(toDate);
    //     const currentDate = new Date(date);
    //     return (!fromDate || currentDate >= from) && (!toDate || currentDate <= to);
    // };

    // const handleTopDownload = async () => {
    //     let billIdsToDownload = [];

    //     if (selectedRows.length === 0) {
    //         billIdsToDownload = billsData.flatMap(group => group.billdets.map(bill => bill._id));

    //         if (billIdsToDownload.length > 0) {
    //             if (!window.confirm(`No bills selected. Download all ${billIdsToDownload.length} filtered bills?`)) {
    //                 return;
    //             }
    //         } else {
    //             alert("No bills available to download.");
    //             return;
    //         }
    //     } else {
    //         billIdsToDownload = selectedRows;
    //     }

    //     try {
    //         const response = await axios.post(
    //             report,
    //             { billIds: billIdsToDownload, format: "excel" },
    //             { responseType: "blob" }
    //         );

    //         const url = window.URL.createObjectURL(
    //             new Blob([response.data], {
    //                 type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //             })
    //         );
    //         const link = document.createElement("a");
    //         link.href = url;
    //         link.setAttribute("download", "report.xlsx");
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);
    //     } catch (error) {
    //         console.error("Error downloading the report:", error);
    //         alert("Failed to download report: " + (error.message || "Unknown error"));
    //     }
    // };

    const handleTopDownload = async () => {
        console.log("Subtotal download clicked");
        const result = await handleExportOutstandingSubtotalReport(selectedRows, billsData, columns, visibleColumnFields, false);
    }

    const handleTopPrint = async () => {
        console.log("Subtotal print clicked");
        const result = await handleExportOutstandingSubtotalReport(selectedRows, billsData, columns, visibleColumnFields, true);
    }

    const columns = [
        { field: "srNo", headerName: "Sr. No" },
        { field: "region", headerName: "Region" },
        { field: "vendorNo", headerName: "Vendor No." },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "copAmt", headerName: "Cop Amount" },
        { field: "dateRecdInAcctsDept", headerName: "Date Received in Accts Dept" }
    ]

    const visibleColumnFields = [
        "srNo", "region", "vendorNo", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "copAmt", "dateRecdInAcctsDept"
    ]

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />
            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Outstanding Bills Report Subtotal as on</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]" onClick={handleTopPrint}>
                            Print
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                        {/* <button className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]" onClick={() => setIsModalOpen(true)}>
                            Send to
                            <img src={send} />
                        </button> */}
                    </div>
                </div>

                <Filters
                    searchQuery={null}
                    setSearchQuery={null}
                    sortBy={null}
                    setSortBy={null}
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                />

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    {loading ? (
                        <p>Loading data...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <table className='w-full border-collapse bg-white'>
                            <thead>
                                <tr>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Region</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor No</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv no</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>COP Amount</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt recd in Accts Dept</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billsData.map((item, index) => (
                                    item.isSubtotal ? (
                                        <tr key={`subtotal-${index}`} className='bg-[#f8f9fa]'>
                                            <td colSpan={2} className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw]'></td>
                                            <td className='border border-black font-semibold text-[14px] py-[1.5vh] px-[1vw]'>
                                                <strong>Count: {item.count.toLocaleString('en-IN')}</strong>
                                            </td>
                                            <td className='border border-black font-semibold text-[14px] py-[1.5vh] px-[1vw]'>
                                                <strong>{item.vendorName}</strong>
                                            </td>
                                            <td colSpan={2}></td>
                                            <td className='border border-black font-semibold text-[14px] py-[1.5vh] px-[1vw]'>
                                                <strong>Total: {item.subtotalAmount.toLocaleString('en-IN')}</strong>
                                            </td>
                                            <td className='border border-black font-semibold text-[14px] py-[1.5vh] px-[1vw]'>
                                                <strong>Total: {item.subtotalCopAmt.toLocaleString('en-IN')}</strong>
                                            </td>
                                            <td colSpan={1}></td>
                                        </tr>
                                    ) : !item.isGrandTotal ? (
                                        <tr key={`bill-${index}`} className="hover:bg-[#f5f5f5]">
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{item.srNo}</td>
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{item.region}</td>
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{item.vendorNo}</td>
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{item.vendorName}</td>
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{item.taxInvNo}</td>
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{item.taxInvDate}</td>
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{item.taxInvAmt.toLocaleString('en-IN')}</td>
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{item.copAmt.toLocaleString('en-IN')}</td>
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{item.dateRecdInAcctsDept}</td>
                                        </tr>
                                    ) : null
                                ))}
                                <tr className='bg-[#e9ecef] font-semibold'>
                                    <td colSpan={2} className='border border-black text-[14px] py-[1.5vh] px-[1vw]'></td>
                                    <td className='border border-black text-[14px] py-[1.5vh] px-[1vw]'>
                                        <strong>Total Count: {totals.totalVendorCount.toLocaleString('en-IN')}</strong>
                                    </td>
                                    <td colSpan={3}></td>
                                    <td className='border border-black text-[14px] py-[1.5vh] px-[1vw]'>
                                        <strong>Grand Total: {totals.totalSubtotal.toLocaleString('en-IN')}</strong>
                                    </td>
                                    <td className='border border-black text-[14px] py-[1.5vh] px-[1vw]'>
                                        <strong>Grand Total: {totals.totalSubtotalCopAmt.toLocaleString('en-IN')}</strong>
                                    </td>
                                    <td colSpan={1}></td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RepBillOutstandingSubtotal;