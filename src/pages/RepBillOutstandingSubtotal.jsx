import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bills, report } from "../apis/bills.api";
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import Filters from '../components/Filters';
import ReportBtns from '../components/ReportBtns';
import SendBox from "../components/SendBox";
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
                const response = await axios.get(bills);
                const rawData = response.data.map(bill => ({
                    _id: bill._id,
                    srNo: bill.srNo || '',
                    region: bill.region || '',
                    vendorNo: bill.vendorNo || '',
                    vendorName: bill.vendorName || '',
                    taxInvNo: bill.taxInvNo || '',
                    taxInvDate: bill.taxInvDate?.split('T')[0] || '',
                    taxInvAmt: parseFloat(bill.taxInvAmt || 0),
                    copAmount: bill.copDetails?.amount || 0,
                    dtRecdAccts: bill.accountsDeptSubmission?.dateGivenToAccounts?.split('T')[0] || ''
                }));

                // Group bills by vendor name
                const groupedByVendor = rawData.reduce((acc, bill) => {
                    if (!acc[bill.vendorName]) {
                        acc[bill.vendorName] = [];
                    }
                    acc[bill.vendorName].push(bill);
                    return acc;
                }, {});

                // Create final data structure with subtotals
                const processedData = Object.entries(groupedByVendor).map(([vendorName, bills]) => ({
                    billdets: bills,
                    subtotal: bills.reduce((sum, bill) => sum + bill.taxInvAmt, 0).toLocaleString('en-IN')
                }));

                setBillsData(processedData);
            } catch (error) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchBills();
    }, []);

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

    const filteredData = billsData
        .filter(group =>
            group.billdets.some(bill =>
                Object.values(bill).some(value =>
                    value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
                )
            )
        )
        .filter(group =>
            group.billdets.some(bill => isWithinDateRange(bill.taxInvDate))
        )
        .sort((a, b) => {
            if (sortBy === "amount") {
                return parseFloat(a.subtotal.replace(/,/g, '')) - parseFloat(b.subtotal.replace(/,/g, ''));
            } else if (sortBy === "date") {
                return new Date(a.billdets[0].taxInvDate) - new Date(b.billdets[0].taxInvDate);
            }
            return 0;
        });

    return (
        <div className='full-report-div'>
            <Header />
            <ReportBtns />
            <div className="invoice-container">
                <div className="header">
                    <h2 className='header-h2'>Outstanding Bills Report Subtotal as on</h2>
                    <div className="report-button-group">
                        <button className="btn print">
                            Print
                            <img src={print} />
                        </button>
                        <button className="btn download" onClick={handleTopDownload}>
                            Download
                            <img src={download} />
                        </button>
                        <button className="btn send" onClick={() => setIsModalOpen(true)}>
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

                <div className="table-container">
                    {loading ? (
                        <p>Loading data...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : (
                        <table className='invoice-table'>
                            <thead>
                                <tr>
                                    {/* <th>
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedRows.length === billsData.flatMap(group => group.billdets).length}
                                        />
                                    </th> */}
                                    <th className='table-th'>Sr No</th>
                                    <th className='table-th'>Region</th>
                                    <th className='table-th'>Vendor No</th>
                                    <th className='table-th'>Vendor Name</th>
                                    <th className='table-th'>Tax Inv no</th>
                                    <th className='table-th'>Tax Inv Date</th>
                                    <th className='table-th'>Tax Inv Amt</th>
                                    <th className='table-th'></th>  {/* Column for sum */}
                                    <th className='table-th'>COP Amount</th>
                                    <th className='table-th'>Dt recd in Accts Dept</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((group, groupIndex) => (
                                    <React.Fragment key={groupIndex}>
                                        {group.billdets.map((bill, index) => (
                                            <tr key={bill._id}>
                                                {/* <td className='table-td'>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(bill._id)}
                                                        onChange={(e) => handleSelectRow(e, bill._id)}
                                                    />
                                                </td> */}
                                                <td className='table-td'>{bill.srNo}</td>
                                                <td className='table-td'>{bill.region}</td>
                                                <td className='table-td'>{bill.vendorNo}</td>
                                                <td className='table-td'>{bill.vendorName}</td>
                                                <td className='table-td'>{bill.taxInvNo}</td>
                                                <td className='table-td'>{bill.taxInvDate}</td>
                                                <td className='right-align table-td'>{bill.taxInvAmt.toLocaleString('en-IN')}</td>
                                                <td className='table-td'></td>  {/* Empty column for sum row */}
                                                <td className='right-align table-td'>{typeof bill.copAmount === 'number' ? bill.copAmount.toLocaleString('en-IN') : bill.copAmount}</td>
                                                <td className='table-td'>{bill.dtRecdAccts}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={7} className='subtotal subtotal-empty'></td>
                                            <td className='subtotal subtotal-text'>Sum:</td>
                                            <td className='subtotal subtotal-num'>{group.subtotal}</td>
                                            <td colSpan={2}></td>
                                        </tr>
                                    </React.Fragment>
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

export default RepBillOutstandingSubtotal;