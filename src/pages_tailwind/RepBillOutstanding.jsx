import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { report } from "../apis/bills.api";
import { outstanding } from '../apis/report.api';
import Header from "../components/Header";
import FiltersOutstanding from '../components/FiltersOutstanding';
import ReportBtns from '../components_tailwind/ReportBtns';
import SendBox from "../components/Sendbox";
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";
import { handleExportOutstandingReport } from "../utils/exportExcelReportOutstanding";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState([]);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await axios.get(`${outstanding}?startDate=${fromDate}&endDate=${toDate}`);
                console.log(response.data);
                let count = 0;
                const filteredData = response?.data?.report.data.map(report => ({
                    id: count++,
                    copAmt: report.copAmt || '',
                    srNo: report.srNo || '',
                    region: report.region || '',
                    vendorNo: report.vendorNo || '',
                    vendorName: report.vendorName || '',
                    taxInvNo: report.taxInvNo || '',
                    taxInvDate: report.taxInvDate?.split('T')[0] || '',
                    taxInvAmt: report.taxInvAmt || '',
                    dateRecdInAcctsDept: report.dateRecdInAcctsDept?.split('T')[0] || '',
                    natureOfWorkSupply: report.natureOfWorkSupply || ''
                }));
                console.log(filteredData);
                setBillsData(filteredData);
            } catch (error) {
                setError("Failed to load data");
                console.error("Error = " + error);
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, [fromDate, toDate]);

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            setSelectedRows(billsData.map(bill => bill.id));
        }
        setSelectAll(!selectAll);
    };

    const handleSelectRow = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    // const handleTopDownload = async () => {
    //     let billIdsToDownload = [];

    //     if (selectedRows.length === 0) {
    //         billIdsToDownload = billsData.map(bill => bill.srNo);

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
        console.log("Download outstanding bill clicked");
        const result = await handleExportOutstandingReport(selectedRows, billsData, columns, visibleColumnFields);
    }

    const columns = [
        // { field: "copAmt", headerName: "COP Amount" },
        { field: "srNo", headerName: "Sr. No" },
        { field: "region", headerName: "Region" },
        { field: "vendorNo", headerName: "Vendor No." },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "taxInvNo", headerName: "Tax Invoice No." },
        { field: "taxInvDate", headerName: "Tax Invoice Date" },
        { field: "taxInvAmt", headerName: "Tax Invoice Amount" },
        { field: "dateRecdInAcctsDept", headerName: "Date Received in Accts Dept" },
        { field: "natureOfWorkSupply", headerName: "Nature of Work" }
    ]

    const visibleColumnFields = [
        "srNo", "region", "vendorNo", "vendorName", "taxInvNo", "taxInvDate", "taxInvAmt", "dateRecdInAcctsDept", "natureOfWorkSupply"
    ]


    // const handleTopDownload = async () => {
    //     const generateReport = async (billIds, format = 'excel') => {
    //         try {
    //             // Prepare the request body
    //             const requestBody = { billIds, format };

    //             // Send the POST request to generate the report
    //             const response = await fetch(report, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify(requestBody),
    //             });

    //             // Check if the request was successful
    //             if (!response.ok) {
    //                 const errorData = await response.json();
    //                 alert(`Error: ${errorData.message}`);
    //                 return;
    //             }

    //             // Get the response as a Blob (binary data) for file download
    //             const blob = await response.blob();

    //             // Extract the file name from the Content-Disposition header
    //             const contentDisposition = response.headers.get('Content-Disposition');
    //             const fileName = contentDisposition
    //                 ? contentDisposition.split('filename=')[1].replace(/"/g, '')
    //                 : `report-${new Date().toISOString()}`;

    //             // Create a URL for the Blob and trigger the download
    //             const downloadUrl = URL.createObjectURL(blob);
    //             const link = document.createElement('a');
    //             link.href = downloadUrl;
    //             link.download = fileName;
    //             document.body.appendChild(link);
    //             link.click();

    //             // Clean up the link element
    //             document.body.removeChild(link);
    //             URL.revokeObjectURL(downloadUrl);
    //         } catch (error) {
    //             console.error('Error generating the report:', error);
    //             alert('An error occurred while generating the report.');
    //         }
    //     };

    //     // const ids = selectedRows.map(bill => bill.srNo);
    //     const ids = ["67cad20efe125d9d5be9a7f3","67cad20efe125d9d5be9a7f5"]
    //     const format = 'excel';
    //     // call function
    //     generateReport(ids, format);
    // }

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
                        <button className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]">
                            Print
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                        <button className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]" onClick={handleSendClick}>
                            Send to
                            <img src={send} />
                        </button>
                    </div>
                </div>

                <FiltersOutstanding
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    regions={uniqueRegions}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={setSelectedRegion}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
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
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Tax Inv recd at Accounts</th>
                                    <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Nature of Work</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billsData.map((bill, index) => (
                                    <tr key={bill.srNo} className="hover:bg-[#f5f5f5]">
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(bill.srNo)}
                                                onChange={() => handleSelectRow(bill.srNo)}
                                            />
                                        </td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.srNo}</td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.region}</td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorNo}</td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorName}</td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvNo}</td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvDate}</td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.taxInvAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.dateRecdInAcctsDept}</td>
                                        <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.natureOfWorkSupply}</td>
                                    </tr>
                                ))}
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

export default RepBillOutstanding;