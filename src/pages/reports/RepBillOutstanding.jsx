import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { outstanding } from '../../apis/report.api';
import { paymentInstructions } from '../../apis/bills.api';
import { toast } from 'react-toastify';
import Header from "../../components/Header";
import Filters from '../../components/Filters';
import ReportBtns from '../../components/ReportBtns';
import PaymentModal from "../../components/PaymentModal";
import ReportGlobalFilter from "../../components/reports/ReportGlobalFilter";
import { useReportGlobalFilter, pickDateFields, pickAmountFields, COUNT } from "../../components/reports/useReportGlobalFilter";
import download from "../../assets/download.svg";
import send from "../../assets/send.svg";
import print from "../../assets/print.svg";
import { handleExportOutstandingBillReports } from "../../utils/exportExcelReportOutstanding";
// import { handleExportAllReports } from '../../utils/exportDownloadPrintReports';

/**
 * Remarks for Payment Instructions, editable in place (23.09, item 13).
 * Saves on Enter or when the cell loses focus, and only if the text changed.
 * Escape puts the saved text back.
 */
const RemarkCell = ({ bill, onSaved }) => {
    const saved = bill.remarksForPaymentInstructions || "";
    const [value, setValue] = useState(saved);
    const [state, setState] = useState("idle"); // idle | saving | error

    useEffect(() => setValue(saved), [saved]);

    const save = async () => {
        if (value === saved || !bill._id) return;
        setState("saving");
        try {
            await axios.patch(`${paymentInstructions}/${bill._id}`, {
                remarksForPayInstructions: value,
            });
            onSaved(bill._id, value);
            setState("idle");
        } catch (error) {
            setState("error");
            toast.error(error.response?.data?.message || `Could not save the remark for Sr No ${bill.srNo}`);
        }
    };

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setState("idle"); }}
            onBlur={save}
            onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") { setValue(saved); setState("idle"); }
            }}
            disabled={state === "saving"}
            title="Type a remark; it saves when you press Enter or leave the cell"
            className={`w-full min-w-[14vw] px-2 py-1 text-[14px] rounded border outline-none focus:border-[#011a99] ${state === "error" ? "border-red-500 bg-red-50" : "border-gray-300"
                } ${state === "saving" ? "opacity-60" : ""}`}
        />
    );
};

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
    const [fromDate, setFromDate] = useState("2020-01-01");
    const [toDate, setToDate] = useState(getFormattedDate());
    const [regionOptions] = useState(() => JSON.parse(Cookies.get('availableRegions') || '[]'));
    const [region, setRegion] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Keep the row in step with what was saved, so print and download pick
    // up the new remark without a reload.
    const handleRemarkSaved = (id, remark) => {
        setBillsData((rows) =>
            rows.map((r) => (r._id === id ? { ...r, remarksForPaymentInstructions: remark } : r))
        );
    };

    const fetchBills = useCallback(async () => {
        try {
            const response = await axios.get(`${outstanding}?startDate=${fromDate}&endDate=${toDate}`);
            console.log(response.data);
            // const filteredData = response?.data?.report.data.map(report => ({
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
    }, [fromDate, toDate]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

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

    // Home-tab search and filter over the rows already fetched (29.09, item 12).
    // The region dropdown above already filtered on the client; it now runs
    // through the same pass, so the grand total follows it too.
    const globalFilter = useReportGlobalFilter(billsData, {
        dateFields: pickDateFields(columns, ["taxInvDate", "dateRecdInAcctsDept"]),
        amountFields: pickAmountFields(columns, ["taxInvAmt", "copAmt"]), // 29.09, item 14
        searchFields: visibleColumnFields,
        totals: { totalCount: COUNT, grandTotalAmount: "taxInvAmt", grandTotalCopAmt: "copAmt" },
        subtotals: { count: COUNT, subtotalAmount: "taxInvAmt", subtotalCopAmt: "copAmt" },
        extraFilter: (bill) => bill.region === region,
        extraFilterActive: region !== "all" && region !== "ALL",
        extraFilterKey: region,
    });

    const visibleBills = globalFilter.dataRows.filter((bill) => bill.srNo);

    useEffect(() => {
        setSelectedRows([]);
    }, [region, globalFilter.filterKey]);

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (newSelectAll) {
            setSelectedRows(visibleBills.map(bill => bill.srNo));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id) => {
        const newSelectedRows = selectedRows.includes(id)
            ? selectedRows.filter(rowId => rowId !== id)
            : [...selectedRows, id];

        setSelectedRows(newSelectedRows);

        const validBills = visibleBills;
        setSelectAll(newSelectedRows.length === validBills.length);
    };

    useEffect(() => {
        const validBills = visibleBills;
        setSelectAll(selectedRows.length === validBills.length && validBills.length > 0);
    }, [selectedRows, visibleBills]);

    const handleTopDownload = async () => {
        console.log("Download outstanding bill clicked");
        // if (selectedRows.length === 0) {
        //     toast.error("Select atleast one row to download");
        //     return;
        // }
        // const result = await handleExportAllReports(selectedRows, billsData.filter(bill => bill.srNo || bill.isGrandTotal), columns, visibleColumnFields, titleName, false, { region, fromDate, toDate });
        const rowsToExport = selectedRows.length > 0 ? selectedRows : visibleBills.map((bill) => bill.srNo);
        const result = await handleExportOutstandingBillReports(rowsToExport, visibleBills, columns, visibleColumnFields, titleName, false, { region, fromDate, toDate });
        console.log(result.message);
    }

    const handleTopPrint = async () => {
        console.log("Print outstanding bill clicked");
        // if (selectedRows.length === 0) {
        //     toast.error("Select atleast one row to print");
        //     return;
        // }
        const rowsToExport = selectedRows.length > 0 ? selectedRows : visibleBills.map((bill) => bill.srNo);
        const result = await handleExportOutstandingBillReports(rowsToExport, visibleBills, columns, visibleColumnFields, titleName, true, { region, fromDate, toDate });
        console.log(result.message);
    }

    const handleSendClick = () => {
        setIsModalOpen(true);
    };

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-screen bg-white text-black">
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
                    region={region}
                    setRegion={setRegion}
                    regionOptions={regionOptions}
                />

                <ReportGlobalFilter {...globalFilter.props} />

                {selectedRows.length > 0 && (
                    <div className="text-[16px] font-medium text-[#333] mb-[1vh] ml-[0.5vw]">
                        Selected: {selectedRows.length}
                    </div>
                )}

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    {loading ? (
                        <p>Loading data...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <table className='w-full border-collapse bg-white'>
                            <thead>
                                <tr>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectAll}
                                        />
                                    </th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Region</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor No</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv no</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Recd in Accounts Dept.</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>COP Amt</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Payment Instructions</th>
                                    <th className='sticky top-0 z-1 border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Remarks for Payment Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleBills.map((bill) => (
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
                                        <td className='border border-black text-[14px] py-[1vh] px-[0.5vw] text-left'>
                                            <RemarkCell bill={bill} onSaved={handleRemarkSaved} />
                                        </td>
                                    </tr>
                                ))
                                }
                                {globalFilter.filteredRows
                                    .filter(bill => bill.isGrandTotal)
                                    .map((bill, index) => (
                                        <tr key={index} className='bg-[#f5f5f5] font-semibold'>
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
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex justify-center items-center z-1000">
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