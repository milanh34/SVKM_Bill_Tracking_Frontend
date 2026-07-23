import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import Filters from "../../components/Filters";
import ReportBtns from '../../components/ReportBtns';
import download from "../../assets/download.svg";
import print from "../../assets/print.svg";
import Cookies from "js-cookie";
import axios from 'axios';
import { invPaid } from '../../apis/report.api';
// import { handleExportRepPaid } from '../../utils/archive/exportExcelReportPaid';
import { handleExportAllReports } from '../../utils/exportDownloadPrintReports';
import { getTodayDateString, getDefaultFromDateString } from '../../utils/dateHelpers';

const InvPaid = () => {

    const [fromDate, setFromDate] = useState(getDefaultFromDateString());
    const [toDate, setToDate] = useState(getTodayDateString());
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [regionOptions] = useState(() => JSON.parse(Cookies.get('availableRegions') || '[]'));
    const [region, setRegion] = useState("all");

    const fetchBills = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                startDate: fromDate,
                endDate: toDate,
            };

            if (region !== "all" && region != "ALL") {
                params.region = region;
            }
            const response = await axios.get(invPaid, { params });
            console.log(response.data);
            setBills(response.data.report?.data || []);
        } catch (error) {
            console.error('Error fetching paid invoices:', error);
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, region]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);


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
        const result = await handleExportAllReports(bills.map(bill => bill.srNo), bills, columns, visibleColumnFields, titleName, true, { region, fromDate, toDate });
        console.log("Result = " + result.message);
    }

    const titleName = "Invoices Paid";

    const columns = [
        { field: "srNo", headerName: "Sr. No" },
        { field: "dateReceivedAtAccts", headerName: "Dt recd in Accts Dept" },
        { field: "dateOfPayment", headerName: "Dt of Payment" },
        { field: "vendorNo", headerName: "Vendor No." },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "copAmount", headerName: "COP Amount" },
        { field: "payentAmt", headerName: "Payment Amount" },
        {field: "f110Identification",headerName:"F110"},
    ]

    const visibleColumnFields = [
        "srNo", "dateReceivedAtAccts", "dateOfPayment", "vendorNo", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "copAmount", "payentAmt","f110Identification"
    ]

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-screen bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Invoices Paid</h2>
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
                />

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    <table className='w-full border-collapse bg-white'>
                        <thead>
                            <tr>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt recd in Accts Dept</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt of payment</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor No</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv No</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>COP Amt</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>F110 Identification</th>
                                <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Payment Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="text-center py-4">Loading...</td>
                                </tr>
                            )
                                // : bills.length === 0 ? (
                                //     <tr>
                                //         <td colSpan="9" className="text-center py-4">No invoices found from {fromDate.split("-")[2]}/{fromDate.split("-")[1]}/{fromDate.split("-")[0]} to {toDate.split("-")[2]}/{toDate.split("-")[1]}/{toDate.split("-")[0]}</td>
                                //     </tr>
                                // )
                                : bills
                                    .filter(bill => !bill.isSubTotal && bill.srNo)
                                    .map((bill, index) => (
                                        <tr key={index} className="hover:bg-[#f5f5f5]">
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.srNo}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.dateReceivedAtAccts}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.dateOfPayment}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.vendorNo}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.vendorName}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.taxInvNo}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvDate}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.taxInvAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.copAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-left'>{bill.f110Identification}</td>
                                            <td className='border border-black text-[14px] py-[0.75vh] px-[0.65vw] text-right'>{bill.payentAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))
                            }
                            {bills
                                .filter(bill => bill.isGrandTotal)
                                .map((bill, index) => (
                                    <tr key={index} className='bg-[#f5f5f5] font-semibold'>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>
                                            <strong>Total Count: {bill.count.toLocaleString('en-IN')}</strong>
                                        </td>
                                        <td colSpan={4} className='border border-black'></td>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Grand Total: {bill.grandTotalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                        </td>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Grand Total: {bill.grandTotalCopAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                        </td>
                                        <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                            <strong>Grand Total: {bill.grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                        </td>
                                        <td colSpan={3} className='border border-black'></td>
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

export default InvPaid;