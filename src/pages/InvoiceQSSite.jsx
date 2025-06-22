import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Filters from "../components/Filters";
import ReportBtns from '../components/ReportBtns';
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";
import axios from 'axios';
import { givenToQSSite } from '../apis/report.api';
import { handleExportRepGivenToQS } from '../utils/exportExcelReportGivenToQS';
import { handleExportAllReports } from '../utils/exportDownloadPrintReports';

const InvoicesGivenToQSSite = () => {

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${givenToQSSite}?startDate=${fromDate}&endDate=${toDate}`);
            console.log(response);
            setBills(response.data.report?.data || []);
        } catch (error) {
            console.error('Error fetching QS site bills:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, [fromDate, toDate]);

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

    const titleName = "Invoices Given to QS site";

    const columns = [
        { field: "srNo", headerName: "Sr. No" },
        { field: "projectDescription", headerName: "Project Description" },
        { field: "vendorName", headerName: "Vendor Name" },
        // { field: "vendorNo", headerName: "Vendor No." },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "dtGivenToQsSite", headerName: "Invoices given to QS Site" },
        { field: "copAmt", headerName: "COP Amount" },
        { field: "poNo", headerName: "PO No" }
    ]

    const visibleColumnFields = [
        "srNo", "projectDescription", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "dtGivenToQsSite", "copAmt", "poNo"
    ]

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Invoices Given to QS Site</h2>
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
                />

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    <table className='w-full border-collapse bg-white'>
                        <thead>
                            <tr>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                {/* <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Project Description</th> */}
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv no</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Invoices given to QS site</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>COP Amt</th>
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
                                    <tr key={index} className="hover:bg-[#f5f5f5]">
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.srNo}</td>
                                        {/* <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.projectDescription}</td> */}
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.vendorName}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.taxInvNo}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.taxInvDate}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.dtGivenToQsSite}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.copAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '-'}</td>
                                        <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.poNo}</td>
                                    </tr>
                                ))
                            }
                            {bills
                                .filter(bill => bill.isGrandTotal)
                                .map((bill) => (
                                    <tr key={bill.totalCount} className='bg-[#f5f5f5] font-semibold'>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>
                                            <strong>Total Count: {bill.totalCount.toLocaleString('en-IN')}</strong>
                                        </td>
                                        <td colSpan={3} className='border border-black'></td>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Grand Total: {bill.grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                        </td>
                                        <td colSpan={1} className='border border-black'></td>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Grand Total: {bill.grandTotalCopAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                        </td>
                                        <td colSpan={1} className='border border-black'></td>
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

export default InvoicesGivenToQSSite;
