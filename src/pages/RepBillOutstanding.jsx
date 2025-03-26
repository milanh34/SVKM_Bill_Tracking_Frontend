import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bills, report } from "../apis/bills.api";
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import FiltersOutstanding from '../components/FiltersOutstanding';
import ReportBtns from '../components/ReportBtns';
import SendBox from "../components/SendBox";

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
                const response = await axios.get(bills);
                console.log(response.data);
                const filteredData = response.data.map(bill => ({
                    _id: bill._id,
                    srNo: bill.srNo || '',
                    region: bill.region || '',
                    vendorNo: bill.vendorNo || '',
                    vendorName: bill.vendorName || '',
                    taxInvNo: bill.taxInvNo || '',
                    taxInvDate: bill.taxInvDate?.split('T')[0] || '',
                    taxInvAmt: bill.taxInvAmt || '',
                    dtTaxInvRecdAtSite: bill.taxInvRecdAtSite?.split('T')[0] || '',
                    natureOfWork: bill.natureOfWork || ''
                }));
                setBillsData(filteredData);
            } catch (error) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            setSelectedRows(billsData.map(bill => bill._id));
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

    const handleTopDownload = async () => {
        let billIdsToDownload = [];

        if (selectedRows.length === 0) {
            billIdsToDownload = filteredData.map(bill => bill._id); i 
            
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

    const filteredData = billsData
        .filter((row) =>
            Object.values(row).some(
                (value) =>
                    value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        .filter((row) =>
            selectedRegion.length === 0 ? true : selectedRegion.includes(row.region)
        )
        .filter((row) => isWithinDateRange(row.taxInvDate))
        .sort((a, b) => {
            if (sortBy === "amount") {
                return parseFloat(String(a.taxInvAmt || "0")) - parseFloat(String(b.taxInvAmt || "0"));
            } else if (sortBy === "date") {
                return new Date(a.taxInvDate || 0) - new Date(b.taxInvDate || 0);
            }
            return 0;
        });

    return (
        <div className='full-report-div'>
            <Header />
            <ReportBtns />

            <div className="invoice-container">
                <div className="header">
                    <h2 className='header-h2'>Outstanding Bills Report as on</h2>
                    <div className="report-button-group">
                        <button className="btn download" onClick={handleTopDownload}>
                            Download
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6 download-icon">
                                <path strokeLinecap="round" strokeWidth="3" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </button>
                        <button className="btn send" onClick={handleSendClick}>
                            Send to
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6 send-icon">
                                <path strokeLinecap="round" strokeWidth="2" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
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

                {/* <div className="invoices-select-all">
                    <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        id="selectAll"
                    />
                    <label htmlFor="selectAll">Select All</label>
                </div> */}

                <div className="table-container">
                    {loading ? (
                        <p>Loading data...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <table className='invoice-table'>
                            <thead>
                                <tr>
                                    {/* <th className="invoices-table-checkbox"></th> */}
                                    <th>Sr No</th>
                                    <th>Region</th>
                                    <th>Vendor No</th>
                                    <th>Vendor Name</th>
                                    <th>Tax Inv no</th>
                                    <th>Tax Inv Date</th>
                                    <th>Tax Inv Amt</th>
                                    <th>Dt Tax Inv recd at Site</th>
                                    <th>Nature of Work</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((bill, index) => (
                                    <tr key={bill._id}>
                                        {/* <td className="invoices-table-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(bill._id)}
                                                onChange={() => handleSelectRow(bill._id)}
                                            />
                                        </td> */}
                                        <td>{index + 1}</td>
                                        <td>{bill.region}</td>
                                        <td>{bill.vendorNo}</td>
                                        <td>{bill.vendorName}</td>
                                        <td>{bill.taxInvNo}</td>
                                        <td className='right-align'>{bill.taxInvDate}</td>
                                        <td className='right-align'>{bill.taxInvAmt}</td>
                                        <td className='right-align'>{bill.dtTaxInvRecdAtSite}</td>
                                        <td>{bill.natureOfWork}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
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