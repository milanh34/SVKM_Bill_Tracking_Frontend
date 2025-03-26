import React, { useState } from 'react';
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import Filters from '../components/Filters';
import ReportBtns from '../components/ReportBtns';

const BillJourney = () => {

    const getFormattedDate = () => {
                    const today = new Date();
                    const day = String(today.getDate()).padStart(2, "0");
                    const month = String(today.getMonth() + 1).padStart(2, "0");
                    const year = today.getFullYear();
                    return `${year}-${month}-${day}`; 
                };
            
    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());

    const bills = [
        { srNo: '8762', region: 'HYDERABAD', projectDesc: 'Hyd External Work', vendorName: 'GEM ENGSERV PRIVATE LIMITED', invoiceDate: '30-12-2024', invoiceAmount: '2,05,569.00', delayReceiving: 3, daysSite: 0, daysMumbai: 4, daysAccount: 14 },
        { srNo: '8806', region: 'Ghansoli', projectDesc: 'Edu complex Ghansoli', vendorName: 'Grune Designs Private Limited', invoiceDate: '24-12-2024', invoiceAmount: '2,68,450.00', delayReceiving: 10, daysSite: 0, daysMumbai: 17, daysAccount: 9 },
        { srNo: '8865', region: 'HYDERABAD', projectDesc: 'Staff QTrs. II', vendorName: 'N. Panthaky and Partners', invoiceDate: '03-01-2025', invoiceAmount: '12,21,141.00', delayReceiving: 1, daysSite: 2, daysMumbai: 8, daysAccount: 6 },
        { srNo: '8866', region: 'HYDERABAD', projectDesc: 'Boys Hostel II', vendorName: 'N. Panthaky and Partners', invoiceDate: '03-01-2025', invoiceAmount: '16,51,399.00', delayReceiving: 1, daysSite: 2, daysMumbai: 8, daysAccount: 6 }
    ];

    return (
        <div>
            <Header />
            <ReportBtns />

            <div className="invoice-container">
                <div className="header">
                    <h2 className='header-h2'>Bill Journey Report</h2>
                    <div className="report-button-group">
                        <button className="btn download">Download</button>
                        <button className="btn send">Send to</button>
                    </div>
                </div>

                <Filters
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                />

                <div className="table-container">
                    <table className='invoice-table'>
                        <thead>
                            <tr>
                                <th>Sr No</th>
                                <th>Region</th>
                                <th>Project Description</th>
                                <th>Vendor Name</th>
                                <th>Invoice Date</th>
                                <th>Invoice Amount</th>
                                <th>Delay for Receiving Invoice</th>
                                <th>No. of Days at Site</th>
                                <th>No. of Days at Mumbai</th>
                                <th>No. of Days at A/c</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={index}>
                                    <td>{bill.srNo}</td>
                                    <td>{bill.region}</td>
                                    <td>{bill.projectDesc}</td>
                                    <td>{bill.vendorName}</td>
                                    <td>{bill.invoiceDate}</td>
                                    <td className='right-align'>{bill.invoiceAmount}</td>
                                    <td className='right-align'>{bill.delayReceiving}</td>
                                    <td className='right-align'>{bill.daysSite}</td>
                                    <td className='right-align'>{bill.daysMumbai}</td>
                                    <td className='right-align'>{bill.daysAccount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default BillJourney;
