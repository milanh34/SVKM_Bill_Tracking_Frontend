import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "../components/Header";
import Filters from '../components/Filters';
import ReportBtns from '../components_tailwind/ReportBtns';
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";
import { receivedAtMumbai } from '../apis/report.api';
import { handleExportRepCourierToMumbai } from '../utils/exportExcelReportCourierMumbai';

const RepRecMumbai = () => {

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
    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());

    useEffect(() => {
        console.log("useEffect in report recd at mumbai");

        const fetchBills = async () => {
            try {
                const response = await axios.get(`${receivedAtMumbai}?startDate=${fromDate}&endDate=${toDate}`);
                console.log(response.data.report.data);
                setBills(response?.data?.report.data);
            }
            catch (err) {
                console.error(err);
                setError("Failed to load data");
            }
            finally {
                setLoading(false);
            }
        }

        fetchBills();
    }, [fromDate, toDate])

    const handleTopDownload = async () => {
        console.log("Rep recd at site download clicked");
        // setSelectedRows(bills.map(bill => bill.srNo));
        const result = await handleExportRepCourierToMumbai(bills.map(bill => bill.srNo), bills, columns, visibleColumnFields, false);
        console.log("Result = " + result.message);
    };

    const handleTopPrint = async () => {
        console.log("Rep recd at site print clicked");
        // if(selectedRows.length === 0){
        //     setSelectedRows(bills.map(bill => bill.srNo));
        // }
        const result = await handleExportRepCourierToMumbai(bills.map(bill => bill.srNo), bills, columns, visibleColumnFields, true);
        console.log("Result = " + result.message);
    }

    const columns = [
        // { field: "copAmt", headerName: "COP Amount" },
        { field: "srNo", headerName: "Sr. No" },
        { field: "projectDescription", headerName: "Project Description" },
        { field: "vendorName", headerName: "Vendor Name" },
        // { field: "vendorNo", headerName: "Vendor No." },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "dtTaxInvRecdAtSite", headerName: "Date Tax Inv recd at Site" },
        { field: "dtTaxInvCourierToMumbai", headerName: "Dt Tax Inv Courier To Mumbai" },
        { field: "poNo", headerName: "PO No" }
    ]

    const visibleColumnFields = [
        "srNo", "projectDescription", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "dtTaxInvRecdAtSite", "dtTaxInvCourierToMumbai", "poNo"
    ]

    return (
        <div>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Invoices Received At Mumbai</h2>
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
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Project Description</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv no</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Tax Inv recd at Site</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Tax Inv recd at Mumbai</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>PO no</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">Loading...</td>
                                </tr>
                            ) : bills.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">No invoices found from {fromDate.split("-")[2]}/{fromDate.split("-")[1]}/{fromDate.split("-")[0]} to {toDate.split("-")[2]}/{toDate.split("-")[1]}/{toDate.split("-")[0]}</td>
                                </tr>
                            ) : bills.map((bill, index) => (
                                <tr key={index} className="hover:bg-[#f5f5f5]">
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.srNo}</td>
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.projectDescription}</td>
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.vendorName}</td>
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.taxInvNo}</td>
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvDate}</td>
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvAmt}</td>
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.dtTaxInvRecdAtSite}</td>
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.dtTaxInvRecdAtMumbai}</td>
                                    <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.poNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default RepRecMumbai;