import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { bills, report } from "../apis/bills.api";
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import Filters from '../components/Filters';
import ReportBtns from '../components/ReportBtns';
import SendBox from "../components/SendBox";

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
                        <button className="btn download" onClick={handleTopDownload}>
                            Download
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6 download-icon">
                                <path strokeLinecap="round" strokeWidth="3" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </button>
                        <button className="btn send" onClick={() => setIsModalOpen(true)}>
                            Send to
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6 send-icon">
                                <path strokeLinecap="round" strokeWidth="2" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
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
                                    <th>Sr No</th>
                                    <th>Region</th>
                                    <th>Vendor No</th>
                                    <th>Vendor Name</th>
                                    <th>Tax Inv no</th>
                                    <th>Tax Inv Date</th>
                                    <th>Tax Inv Amt</th>
                                    <th></th>  {/* Column for sum */}
                                    <th>COP Amount</th>
                                    <th>Dt recd in Accts Dept</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((group, groupIndex) => (
                                    <React.Fragment key={groupIndex}>
                                        {group.billdets.map((bill, index) => (
                                            <tr key={bill._id}>
                                                {/* <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(bill._id)}
                                                        onChange={(e) => handleSelectRow(e, bill._id)}
                                                    />
                                                </td> */}
                                                <td>{bill.srNo}</td>
                                                <td>{bill.region}</td>
                                                <td>{bill.vendorNo}</td>
                                                <td>{bill.vendorName}</td>
                                                <td>{bill.taxInvNo}</td>
                                                <td>{bill.taxInvDate}</td>
                                                <td className='right-align'>{bill.taxInvAmt.toLocaleString('en-IN')}</td>
                                                <td></td>  {/* Empty column for sum row */}
                                                <td className='right-align'>{typeof bill.copAmount === 'number' ? bill.copAmount.toLocaleString('en-IN') : bill.copAmount}</td>
                                                <td>{bill.dtRecdAccts}</td>
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