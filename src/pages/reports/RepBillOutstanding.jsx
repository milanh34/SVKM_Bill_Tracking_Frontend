import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { outstanding } from '../../apis/report.api';
import Header from "../../components/Header";
import Filters from '../../components/Filters';
import ReportBtns from '../../components/ReportBtns';
import PaymentModal from "../../components/PaymentModal";
import download from "../../assets/download.svg";
import send from "../../assets/send.svg";
import print from "../../assets/print.svg";
import { handleExportOutstandingBillReports } from "../../utils/exportExcelReportOutstanding";
// import { handleExportAllReports } from '../../utils/exportDownloadPrintReports';

const RepBillOutstanding = () => {

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const [billsData, setBillsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [fromDate, setFromDate] = useState("2025-04-01");
    const [toDate, setToDate] = useState(getFormattedDate());
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const fetchBills = async () => {
        try {
            const response = await axios.get(`${outstanding}?startDate=${fromDate}&endDate=${toDate}`);
            console.log(response.data);
            let count = 0;
            // const filteredData = response?.data?.report.data.map(report => ({
            //     id: count++,
            //     copAmt: report.copAmt || '',
            //     srNo: report.srNo || '',
            //     region: report.region || '',
            //     vendorNo: report.vendorNo || '',
            //     vendorName: report.vendorName || '',
            //     taxInvNo: report.taxInvNo || '',
            //     taxInvDate: report.taxInvDate?.split('T')[0] || '',
            //     taxInvAmt: report.taxInvAmt || '',
            //     dateRecdInAcctsDept: report.dateRecdInAcctsDept?.split('T')[0] || '',
            //     natureOfWorkSupply: report.natureOfWorkSupply || ''
            // }));
            console.log(response?.data?.report.data);
            // setBillsData(filteredData);
            setBillsData(response?.data?.report.data);
        } catch (error) {
            setError("Failed to load data");
            console.error("Error = " + error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, [fromDate, toDate]);

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        const filteredBills = billsData.filter(bill => !bill.isSubtotal && bill.srNo);
        if (newSelectAll) {
            setSelectedRows(filteredBills.map(bill => bill.srNo));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id) => {
        const newSelectedRows = selectedRows.includes(id)
            ? selectedRows.filter(rowId => rowId !== id)
            : [...selectedRows, id];

        setSelectedRows(newSelectedRows);

        const validBills = billsData.filter(bill => !bill.isSubtotal && bill.srNo);
        setSelectAll(newSelectedRows.length === validBills.length);
    };

    useEffect(() => {
        const validBills = billsData.filter(bill => !bill.isSubtotal && bill.srNo);
        setSelectAll(selectedRows.length === validBills.length && validBills.length > 0);
    }, [selectedRows, billsData]);

    const handleTopDownload = async () => {
        console.log("Download outstanding bill clicked");
        // if (selectedRows.length === 0) {
        //     toast.error("Select atleast one row to download");
        //     return;
        // }
        // const result = await handleExportAllReports(selectedRows, billsData.filter(bill => bill.srNo || bill.isGrandTotal), columns, visibleColumnFields, titleName, false);
        const result = await handleExportOutstandingBillReports(selectedRows, billsData.filter(bill => bill.srNo || bill.isGrandTotal), columns, visibleColumnFields, titleName, false);
        console.log(result.message);
    }

    const handleTopPrint = async () => {
        console.log("Print outstanding bill clicked");
        // if (selectedRows.length === 0) {
        //     toast.error("Select atleast one row to print");
        //     return;
        // }
        const result = await handleExportOutstandingBillReports(selectedRows, billsData.filter(bill => !bill.isSubtotal && bill.srNo), columns, visibleColumnFields, titleName, true);
        console.log(result.message);
    }

    const titleName = "Outstanding Bills Report as on";

    const columns = [
        // { field: "copAmt", headerName: "COP Amount" },
        { field: "srNo", headerName: "Sr. No" },
        { field: "region", headerName: "Region" },
        { field: "vendorNo", headerName: "Vendor No." },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "dateRecdInAcctsDept", headerName: "Dt Recd in Accts Dept" },
        { field: "copAmt", headerName: "COP Amt" },
        { field: "paymentInstructions", headerName: "Payment Instructions" },
        { field: "remarksForPaymentInstructions", headerName: "Remarks For Payment Instructions" }
    ]

    const visibleColumnFields = [
        "srNo", "region", "vendorNo", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "dateRecdInAcctsDept", "copAmt", "paymentInstructions", "remarksForPaymentInstructions"
    ]

    const handleSendClick = () => {
        setIsModalOpen(true);
    };

    const isWithinDateRange = (date) => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const currentDate = new Date(date);
        return (!fromDate || currentDate >= from) && (!toDate || currentDate <= to);
    };

    const uniqueRegions = [...new Set(billsData.map(bill => bill.region))];

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Outstanding Bills Report as on</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]" onClick={handleTopPrint}>
                            Print
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                        <button
                            className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]"
                            onClick={handleSendClick}
                        >
                            Payment
                            <img src={send} />
                        </button>
                    </div>
                </div>

                <Filters
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
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectAll}
                                        />
                                    </th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Region</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor No</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv no</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Recd in Accounts Dept.</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>COP Amt</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Payment Instructions</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Remarks for Payment Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billsData
                                    .filter(bill => !bill.isSubtotal && bill.srNo)
                                    .map((bill) => (
                                        <tr key={bill.srNo} className="hover:bg-[#f5f5f5]">
                                            <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(bill.srNo)}
                                                    onChange={() => handleSelectRow(bill.srNo)}
                                                />
                                            </td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.srNo}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.region}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorNo}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorName}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvNo}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvDate}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.taxInvAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.dateRecdInAcctsDept}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.copAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.paymentInstructions}</td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.remarksForPaymentInstructions}</td>
                                        </tr>
                                    ))
                                }
                                {billsData
                                    .filter(bill => bill.isGrandTotal)
                                    .map((bill) => (
                                        <tr key={bill.totalCount} className='bg-[#f5f5f5] font-semibold'>
                                            <td colSpan={1} className='border border-black text-[14px] py-[1.5vh] px-[1vw]'></td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                                <strong>Total Count: {bill.totalCount.toLocaleString('en-IN')}</strong>
                                            </td>
                                            <td colSpan={5} className='border border-black'></td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                                <strong>Grand Total: {bill.grandTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                            </td>
                                            <td colSpan={1} className='border border-black'></td>
                                            <td className='border border-black text-[14px] py-[1.5vh] px-[1vw] text-right'>
                                                <strong>Grand Total: {bill.grandTotalCopAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                                            </td>
                                            <td colSpan={2} className='border border-black'></td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex justify-center items-center z-[1000]">
                    <PaymentModal
                        closeWindow={() => setIsModalOpen(false)}
                        selectedBills={selectedRows}
                        billsData={billsData.map(bill => ({
                            _id: bill.srNo,
                            srNo: bill.srNo,
                            vendorName: bill.vendorName,
                            taxInvAmt: bill.taxInvAmt
                        }))}
                        fetchBills={fetchBills}
                    />
                </div>
            )}
        </div>
    );
};

export default RepBillOutstanding;