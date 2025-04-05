import React, { useEffect, useState } from 'react';
import Header from "../components/Header";
import { bills, report, getReport } from "../apis/bills.api";
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

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Invoices Couriered to Mumbai</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]">
                            Print
                            <img src={print} />
                        </button>
                        <button className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]">
                            Download
                            <img src={download} />
                        </button>
                        <button className="w-[300px] bg-[#34915C] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#45a049]">
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

                <div className="overflow-x-auto shadow-md max-h-[85vh] relative border border-black">
                    <table className='w-full border-collapse bg-white'>
                        <thead>
                            <tr>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Sr No</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Project Description</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv no</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Date</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Tax Inv Amt</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Tax Inv recd at Site</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Dt Tax Inv courier to Mumbai</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>PO no</th>
                            </tr>
                        </thead>
                        <tbody>
                            {billsData.map((bill, index) => (
                                <tr key={index} className="hover:bg-[#f5f5f5]">
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.srNo}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.projectDesc}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorName}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvNo}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvDate}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvAmt}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.dtTaxInvRecdAtSite}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.dtTaxInvCourierToMum}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.poNo}</td>
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