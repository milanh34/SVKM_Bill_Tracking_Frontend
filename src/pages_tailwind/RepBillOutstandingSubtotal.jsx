import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { report } from "../apis/bills.api";
import { outstanding } from '../apis/report.api';
import Header from "../components/Header";
import Filters from '../components/Filters';
import ReportBtns from '../components_tailwind/ReportBtns';
import SendBox from "../components/Sendbox";
import download from "../assets/download.svg";
import send from "../assets/send.svg";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await axios.get(`${outstanding}`);
                const rawData = response.data.report.data.map(report => ({
                    srNo: report.srNo || '',
                    region: report.region || '',
                    vendorNo: report.vendorNo || '',
                    vendorName: report.vendorName || '',
                    taxInvNo: report.taxInvNo || '',
                    taxInvDate: report.taxInvDate || '',
                    taxInvAmt: parseFloat(report.taxInvAmt || 0),
                    copAmount: report.copAmt?.amount || 0,
                    dtRecdAccts: report.dateRecdInAcctsDept || ''
                }));

                const filteredData = rawData
                    .filter(report =>
                        isWithinDateRange(report.taxInvDate)
                    )
                    .sort((a, b) => {
                        if (sortBy === "amount") {
                            return a.taxInvAmt - b.taxInvAmt;
                        } else if (sortBy === "date") {
                            return new Date(a.taxInvDate) - new Date(b.taxInvDate);
                        }
                        return 0;
                    });

                const groupedByVendor = filteredData.reduce((acc, bill) => {
                    if (!acc[bill.vendorName]) {
                        acc[bill.vendorName] = [];
                    }
                    acc[bill.vendorName].push(bill);
                    return acc;
                }, {});

                const processedData = Object.entries(groupedByVendor).map(([vendorName, bills]) => ({
                    billdets: bills,
                    subtotal: bills.reduce((sum, bill) => sum + bill.taxInvAmt, 0),
                    subtotalCopAmt: bills.reduce((sums, bill) => sums + bill.copAmount, 0),
                    vendorCount: bills.length
                }));

                setBillsData(processedData);

                const totals = processedData.reduce(
                    (acc, { subtotal, subtotalCopAmt, vendorCount }) => {
                        acc.totalSubtotal += subtotal;
                        acc.totalSubtotalCopAmt += subtotalCopAmt;
                        acc.totalVendorCount += vendorCount;
                        return acc;
                    },
                    {
                        totalSubtotal: 0,
                        totalSubtotalCopAmt: 0,
                        totalVendorCount: 0
                    }
                );

                setTotals({
                    totalSubtotal: totals.totalSubtotal,
                    totalSubtotalCopAmt: totals.totalSubtotalCopAmt,
                    totalVendorCount: totals.totalVendorCount
                });

            } catch (error) {
                setError("Failed to load data");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, [fromDate, toDate]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allRows = billsData.flatMap(group => group.billdets.map(bill => bill._id));
            setSelectedRows(allRows);
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (e, id) => {
        if (e.target.checked) {
            setSelectedRows(prev => [...prev, id]);
        } else {
            setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        }
    };

    const isWithinDateRange = (date) => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const currentDate = new Date(date);
        return (!fromDate || currentDate >= from) && (!toDate || currentDate <= to);
    };

    const handleTopDownload = async () => {
        let billIdsToDownload = [];

        if (selectedRows.length === 0) {
            billIdsToDownload = billsData.flatMap(group => group.billdets.map(bill => bill._id));

            if (billIdsToDownload.length > 0) {
                if (!window.confirm(`No bills selected. Download all ${billIdsToDownload.length} filtered bills?`)) {
                    return;
                }
            } else {
                alert("No bills available to download.");
                return;
            }
        } else {
            billIdsToDownload = selectedRows;
        }

        try {
            const response = await axios.post(
                report,
                { billIds: billIdsToDownload, format: "excel" },
                { responseType: "blob" }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                })
            );
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "report.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading the report:", error);
            alert("Failed to download report: " + (error.message || "Unknown error"));
        }
    };

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />
            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Outstanding Bills Report Subtotal as on</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]">
                            Print
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                        <button className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]" onClick={() => setIsModalOpen(true)}>
                            Send to
                            <img src={send} />
                        </button>
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
                                {billsData.map((group, groupIndex) => (
                                    <React.Fragment key={groupIndex}>
                                        {group.billdets.map((bill) => (
                                            <tr key={bill._id} className="hover:bg-[#f5f5f5]">
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.srNo}</td>
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.region}</td>
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorNo}</td>
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorName}</td>
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvNo}</td>
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvDate}</td>
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.taxInvAmt.toLocaleString('en-IN')}</td>
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{typeof bill.copAmount === 'number' ? bill.copAmount.toLocaleString('en-IN') : bill.copAmount}</td>
                                                <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.dtRecdAccts}</td>
                                            </tr>
                                        ))}
                                        <tr className='bg-[#f8f9fa]'>
                                            <td colSpan={2} className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw]'></td>
                                            <td className='border border-black font-semibold text-[14px] py-[1.5vh] px-[1vw]'><strong>Count: {group.vendorCount.toLocaleString('en-IN')}</strong></td>
                                            <td className='border border-black font-semibold text-[14px] py-[1.5vh] px-[1vw]'><strong>{group.billdets[0].vendorName}</strong></td>
                                            <td colSpan={2}></td>
                                            <td className='border border-black font-semibold text-[14px] py-[1.5vh] px-[1vw]'><strong>Total: {group.subtotal.toLocaleString('en-IN')}</strong></td>
                                            <td className='border border-black font-semibold text-[14px] py-[1.5vh] px-[1vw]'><strong>Total: {group.subtotalCopAmt.toLocaleString('en-IN')}</strong></td>
                                            <td colSpan={1}></td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                                <tr className='bg-[#e9ecef] font-semibold'>
                                    <td colSpan={2} className='border border-black text-[14px] py-[1.5vh] px-[1vw]'></td>
                                    <td className='border border-black text-[14px] py-[1.5vh] px-[1vw]'><strong>Total Count: {totals.totalVendorCount.toLocaleString('en-IN')}</strong></td>
                                    <td colSpan={3}></td>
                                    <td className='border border-black text-[14px] py-[1.5vh] px-[1vw]'><strong>Grand Total: {totals.totalSubtotal.toLocaleString('en-IN')}</strong></td>
                                    <td className='border border-black text-[14px] py-[1.5vh] px-[1vw]'><strong>Grand Total: {totals.totalSubtotalCopAmt.toLocaleString('en-IN')}</strong></td>
                                    <td colSpan={1}></td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <SendBox
                        closeWindow={() => setIsModalOpen(false)}
                        selectedBills={selectedRows}
                        billsData={billsData}
                    />
                </div>
            )}
        </div>
    );
};

export default RepBillOutstandingSubtotal;