import React, { useState } from 'react';
import Header from "../components/Header";
import Filters from '../components/Filters';
import ReportBtns from '../components_tailwind/ReportBtns';
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";
import axios from 'axios';
import { pendingBills } from '../apis/report.api';

const ReportsPending = () => {

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
        { srNo: '8736', projectDesc: 'MPSTME 8th Floor', vendorName: 'INNER SPACE', taxInvNo: 'SE/20/2024', taxInvDate: '30-12-2024', taxInvAmt: '8,055.15', dtTaxInvRecdAtSite: '02-01-2025', dtBillRecdAtPIMO: '02-01-2025', poNo: '8000010464' },
        { srNo: '8737', projectDesc: 'MPSTME 3rd to 6th Floor', vendorName: 'INNER SPACE', taxInvNo: '123', taxInvDate: '24-12-2024', taxInvAmt: '1,28,820.61', dtTaxInvRecdAtSite: '02-01-2025', dtBillRecdAtPIMO: '02-01-2025', poNo: '800012505' },
        { srNo: '8738', projectDesc: 'D J Sanghvi 5th Floor', vendorName: 'INNER SPACE', taxInvNo: 'SGD-123-2025', taxInvDate: '03-01-2025', taxInvAmt: '6,904.42', dtTaxInvRecdAtSite: '02-01-2025', dtBillRecdAtPIMO: '02-01-2025', poNo: '8000010465' },
        { srNo: '8868', projectDesc: 'SBMP Phase II', vendorName: 'SUDHIR POWER LTD', taxInvNo: 'GST105253906', taxInvDate: '21-12-2024', taxInvAmt: '42,83,400.00', dtTaxInvRecdAtSite: '06-01-2025', dtBillRecdAtPIMO: '07-01-2025', poNo: '7000019763' },
        { srNo: '8869', projectDesc: 'SBMP Phase II', vendorName: 'SUDHIR POWER LTD', taxInvNo: 'GST105253907', taxInvDate: '21-12-2024', taxInvAmt: '42,83,400.00', dtTaxInvRecdAtSite: '06-01-2025', dtBillRecdAtPIMO: '07-01-2025', poNo: '7000019763' },
        { srNo: '8870', projectDesc: 'SBMP Phase II', vendorName: 'SUDHIR POWER LTD', taxInvNo: 'GST105253908', taxInvDate: '21-12-2024', taxInvAmt: '42,83,400.00', dtTaxInvRecdAtSite: '06-01-2025', dtBillRecdAtPIMO: '07-01-2025', poNo: '7000019763' }
    ];

    return (
        <div>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Reports of pending bills with PIMO/SVKM site officer/QS Mumbai office/QS site office</h2>
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
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Invoice no</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Invoice Date</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Invoice Amount</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Date Invoice received at Site</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Date Bill received at PIMO/RRMO</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>PO No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={index} className="hover:bg-[#f5f5f5]">
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.srNo}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.projectDesc}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorName}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvNo}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.taxInvDate}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.taxInvAmt}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.dtTaxInvRecdAtSite}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.dtBillRecdAtPIMO}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.poNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPending;
