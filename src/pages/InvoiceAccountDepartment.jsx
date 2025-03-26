import React, { useState } from 'react';
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import Filters from '../components/Filters';
import ReportBtns from '../components/ReportBtns';
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";

const InvoicesGivenToAccountDept = () => {

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());

    const bills = [...Array(10)].map((_, index) => ({
        srNo: '8737',
        projectDesc: 'MPSTIME 3rd to 6th Floor',
        vendorName: 'Inner Space',
        taxInvNo: '123',
        taxInvDate: '02.10.2024',
        taxInvAmt: '1,26,620.81',
        dtTaxInvRecdAtSite: '02-02-2024',
        dtTaxInvCourierToMumbai: '02-02-2024',
        poNo: '8000010464'
    }));

    return (
        <div>
            <Header />
            <ReportBtns />

            <div className="invoice-container">
                <div className="header">
                    <h2 className='header-h2'>Invoices Given to Account Department</h2>
                    <div className="report-button-group">
                        <button className="btn print">
                            Print
                            <img src={print} />
                        </button>
                        <button className="btn download">
                            Download
                            <img src={download} />
                        </button>
                        <button className="btn send">
                            Send to
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

                <div className="table-container">
                    <table className='invoice-table'>
                        <thead>
                            <tr>
                                <th className='table-th'>Sr No</th>
                                <th className='table-th'>Project Description</th>
                                <th className='table-th'>Vendor Name</th>
                                <th className='table-th'>Tax Inv no</th>
                                <th className='table-th'>Tax Inv Date</th>
                                <th className='table-th'>Tax Inv Amt</th>
                                <th className='table-th'>Dt Tax Inv recd at Site</th>
                                <th className='table-th'>Dt Tax Inv courier to Mumbai</th>
                                <th className='table-th'>PO No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={index}>
                                    <td className='table-td'>{bill.srNo}</td>
                                    <td className='table-td'>{bill.projectDesc}</td>
                                    <td className='table-td'>{bill.vendorName}</td>
                                    <td className='table-td'>{bill.taxInvNo}</td>
                                    <td className='table-td'>{bill.taxInvDate}</td>
                                    <td className='right-align table-td'>{bill.taxInvAmt}</td>
                                    <td className='right-align table-td'>{bill.dtTaxInvRecdAtSite}</td>
                                    <td className='right-align table-td'>{bill.dtTaxInvCourierToMumbai}</td>
                                    <td className='table-td'>{bill.poNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default InvoicesGivenToAccountDept;
