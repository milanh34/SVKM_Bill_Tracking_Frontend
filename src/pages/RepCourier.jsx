import React, { useEffect, useState } from 'react';
import Header from "../components/Header";
import { bills, report, getReport } from "../apis/bills.api";
import "../styles/ReportsBasic.css";
import Filters from '../components/Filters';
import ReportBtns from '../components/ReportBtns';
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";

const RepCourier = () => {

    const getFormattedDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState(getFormattedDate());
    const [toDate, setToDate] = useState(getFormattedDate());
    const [billsData, setBillsData] = useState([]);
    const [error, setError] = useState(null);


    useEffect(() => {
        console.log("Inside use effect inv couriered to mum");
        const fetchBills = async () => {

            try {
                const response = await axios.get(`${getReport}/invoices-courier-to-mumbai?startDate=2023-01-01&endDate=2025-12-31`);
                console.log(response.data);
                const filteredData = response.data.report.data.map(report => ({
                    // _id: bill._id,
                    srNo: report.srNo || '',
                    projectDesc: report.projectDescription || '',
                    vendorName: report.vendorName || '',
                    taxInvNo: report.taxInvNo || '',
                    taxInvDate: report.taxInvDate || '',
                    taxInvAmt: report.taxInvAmt || '',
                    dtTaxInvRecdAtSite: report.dtTaxInvRecdAtSite || '',
                    poNo: report.poNo || ''
                }));
                setBillsData(filteredData);
            }
            catch (err) {
                setError("Failed to load data");
                console.error("Error = " + error);
            } finally {
                setLoading(false);
            }
        }

        fetchBills();
    }, []);

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
                    <h2 className='header-h2'>Invoices Couriered to Mumbai</h2>
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
                                <th className='table-th'>PO no</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billsData.map((bill, index) => (
                                <tr key={index}>
                                    <td className='table-td'>{bill.srNo}</td>
                                    <td className='table-td'>{bill.projectDesc}</td>
                                    <td className='table-td'>{bill.vendorName}</td>
                                    <td className='table-td'>{bill.taxInvNo}</td>
                                    <td className='right-align table-td'>{bill.taxInvDate}</td>
                                    <td className='right-align table-td'>{bill.taxInvAmt}</td>
                                    <td className='right-align table-td'>{bill.dtTaxInvRecdAtSite}</td>
                                    <td className='right-align table-td'>{bill.dtTaxInvCourierToMum}</td>
                                    <td className='right-align table-td'>{bill.poNo}</td>
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