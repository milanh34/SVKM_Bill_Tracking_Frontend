import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bills, report } from "../apis/bills.api";
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import Filters from '../components/Filters';
import ReportBtns from '../components/ReportBtns';
import SendBox from "../components/Sendbox";
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";
import Cookies from "js-cookie";

const RepRecAtSite = () => {

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

    useEffect(() => {
        if (Cookies.get("userRole") === null) {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const response = await axios.get(bills);
                const filteredData = response.data.map(bill => ({
                    _id: bill._id,
                    srNo: bill.srNo || '',
                    projectDesc: bill.projectDescription || '',
                    vendorName: bill.vendorName || '',
                    taxInvNo: bill.taxInvNo || '',
                    taxInvDate: bill.taxInvDate?.split('T')[0] || '',
                    taxInvAmt: bill.taxInvAmt || '',
                    dtTaxInvRecdAtSite: bill.taxInvRecdAtSite?.split('T')[0] || '',
                    poNo: bill.poNo || ''
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

    useEffect(() => {
        if (selectAll) {
            setSelectedRows(billsData.map(bill => bill._id));
        }
    }, [billsData, selectAll]);

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
        setSelectedRows(selectAll ? [] : billsData.map(bill => bill._id));
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prevSelected =>
            prevSelected.includes(id)
                ? prevSelected.filter(rowId => rowId !== id)
                : [...prevSelected, id]
        );
    };

    const handleTopDownload = async () => {
        try {

            const billIdsToDownload = selectedRows.length === 0
                ? billsData.map(bill => bill._id)
                : selectedRows;

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
        }
    };

    const handleSendClick = () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one bill to send.");
            return;
        }
        setIsModalOpen(true);
    };

    const isWithinDateRange = (dateString) => {
        if (!dateString) return true;
        if (!fromDate && !toDate) return true;

        const date = new Date(dateString.split("T")[0]);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (from) from.setHours(0, 0, 0, 0);
        if (to) to.setHours(23, 59, 59, 999);

        if (from && to) return date >= from && date <= to;
        else if (from) return date >= from;
        else if (to) return date <= to;

        return true;
    };

    const filteredData = billsData
        .filter((row) =>
            Object.values(row).some(
                (value) =>
                    value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
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
                    <h2 className='header-h2'>Invoices Received At Site</h2>
                    <div className="report-button-group">
                        <button className="btn print">
                            Print
                            <img src={print} />
                        </button>
                        <button className="btn download" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                        <button className="btn send" onClick={handleSendClick}>
                            Send to
                            <img src={send} />
                        </button>
                    </div>
                </div>

                <Filters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
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
                        <>

                            <table className='invoice-table'>
                                <thead>
                                    <tr>
                                        {/* <th className="invoices-table-checkbox"></th> */}
                                        <th className='table-th'>Sr No</th>
                                        <th className='table-th'>Project Description</th>
                                        <th className='table-th'>Vendor Name</th>
                                        <th className='table-th'>Tax Inv no</th>
                                        <th className='table-th'>Tax Inv Date</th>
                                        <th className='table-th'>Tax Inv Amt</th>
                                        <th className='table-th'>Dt Tax Inv recd at Site</th>
                                        <th className='table-th'>PO No</th>
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
                                            <td className='table-td'>{index + 1}</td>
                                            <td className='table-td'>{bill.projectDesc}</td>
                                            <td className='table-td'>{bill.vendorName}</td>
                                            <td className='table-td'>{bill.taxInvNo}</td>
                                            <td className='table-td'>{bill.taxInvDate}</td>
                                            <td className='right-align table-td'>{bill.taxInvAmt}</td>
                                            <td className='right-align table-td'>{bill.dtTaxInvRecdAtSite}</td>
                                            <td className='table-td'>{bill.poNo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
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
    )
}

export default RepRecAtSite