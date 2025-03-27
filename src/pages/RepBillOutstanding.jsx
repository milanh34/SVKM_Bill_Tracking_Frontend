import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bills, report } from "../apis/bills.api";
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import FiltersOutstanding from '../components/FiltersOutstanding';
import ReportBtns from '../components/ReportBtns';
import SendBox from "../components/Sendbox";
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";

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
                                    <th className='table-th'>Sr No</th>
                                    <th className='table-th'>Region</th>
                                    <th className='table-th'>Vendor No</th>
                                    <th className='table-th'>Vendor Name</th>
                                    <th className='table-th'>Tax Inv no</th>
                                    <th className='table-th'>Tax Inv Date</th>
                                    <th className='table-th'>Tax Inv Amt</th>
                                    <th className='table-th'>Dt Tax Inv recd at Site</th>
                                    <th className='table-th'>Nature of Work</th>
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
                                        <td className='table-td'>{bill.region}</td>
                                        <td className='table-td'>{bill.vendorNo}</td>
                                        <td className='table-td'>{bill.vendorName}</td>
                                        <td className='table-td'>{bill.taxInvNo}</td>
                                        <td className='right-align table-td'>{bill.taxInvDate}</td>
                                        <td className='right-align table-td'>{bill.taxInvAmt}</td>
                                        <td className='right-align table-td'>{bill.dtTaxInvRecdAtSite}</td>
                                        <td className='table-td'>{bill.natureOfWork}</td>
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