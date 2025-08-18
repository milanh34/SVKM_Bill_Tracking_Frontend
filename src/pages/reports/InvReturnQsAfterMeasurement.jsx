import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Filters from "../../components/Filters";
import ReportBtns from '../../components/ReportBtns';
import download from "../../assets/download.svg";
import send from "../../assets/send.svg";
import print from "../../assets/print.svg";
import Cookies from "js-cookie";
import axios from 'axios';
import { courieredMumbai, invReturnQsMeasurement } from '../../apis/report.api';
// import { handleExportRepCourierToMumbai } from '../../utils/archive/exportExcelReportCourierMumbai';
import { handleExportAllReports } from '../../utils/exportDownloadPrintReports';

const InvReturnQsAfterProvCOP = () => {

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const availableRegions = JSON.parse(Cookies.get('availableRegions') || '[]');

    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());
    const [bills, setBills] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totals, setTotals] = useState([]);
    const [regionOptions, setRegionOptions] = useState([]);
    const [region, setRegion] = useState("all");

    useEffect(() => {
        setRegionOptions(availableRegions);
        setRegion(availableRegions);
    }, [])

    const fetchBills = async () => {
        try {
            const response = await axios.get(invReturnQsMeasurement, { params });
            console.log(response.data.report);
            setBills(response.data.report.data);
            setTotals(response.data.report.summary);
        }
        catch (err) {
            setError("Failed to load data");
            console.error("Error = " + error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBills();
    }, [fromDate, toDate, region]);


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

    const titleName = "Invoices Returned by QS Site after Measurement";

    const columns = [
        { field: "srNo", headerName: "Sr. No" },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "dateReturnedFromQsMeasurement", headerName: "Dt ret-QS aft measure" }, // column no 38
    ]

    const visibleColumnFields = [
        "srNo", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "pimoMumbai.dateGiven", "dateReturnedFromQsMeasurement"
    ]


    const handleSendClick = () => {
        setIsModalOpen(true);
    };


    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>{titleName}</h2>
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
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    region={region}
                    setRegion={setRegion}
                    regionOptions={regionOptions}
                />

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    <table className='w-full border-collapse bg-white'>
                        <thead>
                            <tr>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Count</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv no</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Return QS after Measurement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">Loading...</td>
                                </tr>
                            )
                                // : bills.length === 0 || bills[0].totalCount === 0 ? (
                                //     <tr>
                                //         <td colSpan="9" className="text-center py-4">No invoices found from {fromDate.split("-")[2]}/{fromDate.split("-")[1]}/{fromDate.split("-")[0]} to {toDate.split("-")[2]}/{toDate.split("-")[1]}/{toDate.split("-")[0]}</td>
                                //     </tr>
                                // ) 
                                : bills
                                    .filter(bill => !bill.isSubtotal && bill.srNo)
                                    .map((bill, index) => (
                                        <tr key={index} className="hover:bg-[#f5f5f5]">
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{index + 1}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.srNo}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.vendorName}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.taxInvNo}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvDate}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.dateReturnedFromQsMeasurement}</td>
                                        </tr>
                                    ))}
                            {bills
                                .filter(bill => bill.isGrandTotal)
                                .map((bill) => (
                                    <tr key={bill.totalCount} className='bg-[#f5f5f5] font-semibold'>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>
                                            <strong>Total Count: {bill.count.toLocaleString('en-IN')}</strong>
                                        </td>
                                        <td colSpan={4} className='border border-black'></td>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Grand Total: {bill.grandTotalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                        </td>
                                        <td colSpan={3} className='border border-black'></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <SendBox
                        closeWindow={() => setIsModalOpen(false)}
                        // selectedBills={selectedRows}
                        // billsData={billsData}
                    />
                </div>
            )} */}

        </div>
    )
}

export default InvReturnQsAfterProvCOP;