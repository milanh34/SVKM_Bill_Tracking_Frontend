import React, { useState } from 'react';
import Header from "../components/Header";
import "../styles/ReportsBasic.css";
import Filters from '../components/Filters';
import ReportBtns from '../components/ReportBtns';

const RepCourier = () => {

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`; 
    };

    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());

    const bills = [...Array(20)].map((_, index) => ({
        srNo: '8737',
        projectDesc: 'MPSTME 3rd to 6th Floor',
        vendorName: 'Inner Space',
        taxInvNo: '123',
        taxInvDate: '22-10-2024',
        taxInvAmt: '1,26,620.81',
        dtTaxInvRecdAtSite: '22-02-2024',
        dtTaxInvCourierToMum: '22-02-2024',
        poNo: '8000010464'
    }));

    // const invoices = [
    //     {
    //         count: 2,
    //         srNo: '8737',
    //         projectDescription: 'MPSTIME 3rd to 6th Floor',
    //         vendorName: 'INNER SPACE',
    //         taxInvNo: '123',
    //         taxInvDate: '02.10.2024',
    //         taxInvAmt: '1,26,620.81',
    //         dtTaxInvRecdAtSite: '02-02-2024'
    //     },
    //     {
    //         count: 2,
    //         srNo: '8736',
    //         projectDescription: 'MPSTIME 4th Floor',
    //         vendorName: 'INNER SPACE',
    //         taxInvNo: 'SE/20/2024',
    //         taxInvDate: '01.12.2024',
    //         taxInvAmt: '8,055.15',
    //         dtTaxInvRecdAtSite: '02-02-2024'
    //     }
    // ];


    return (
        <div className='full-report-div'>
            <Header />
            <ReportBtns />

            <div className="invoice-container">

                <div className="header">
                    <h2 className='header-h2'>Invoices Courier to Mumbai</h2>
                    <div className="report-button-group">
                        <button className="btn download">
                            Download
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6 download-icon">
                                <path strokeLinecap="round" strokeWidth="3" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        </button>
                        <button className="btn send">
                            Send to
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6 send-icon">
                                <path strokeLinecap="round" strokeWidth="2" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                            </svg>
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
                                <th>Sr No</th>
                                <th>Project Description</th>
                                <th>Vendor Name</th>
                                <th>Tax Inv no</th>
                                <th>Tax Inv Date</th>
                                <th>Tax Inv Amt</th>
                                <th>Dt Tax Inv recd at Site</th>
                                <th>Dt Tax Inv courier to Mumbai</th>
                                <th>PO no</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={index}>
                                    <td>{bill.srNo}</td>
                                    <td>{bill.projectDesc}</td>
                                    <td>{bill.vendorName}</td>
                                    <td>{bill.taxInvNo}</td>
                                    <td className='right-align'>{bill.taxInvDate}</td>
                                    <td className='right-align'>{bill.taxInvAmt}</td>
                                    <td className='right-align'>{bill.dtTaxInvRecdAtSite}</td>
                                    <td className='right-align'>{bill.dtTaxInvCourierToMum}</td>
                                    <td className='right-align'>{bill.poNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default RepCourier;