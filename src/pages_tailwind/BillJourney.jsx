import React, { useState } from 'react';
import Header from "../components/Header";
import Filters from '../components/Filters';
import ReportBtns from '../components_tailwind/ReportBtns';
import download from "../assets/download.svg";
import send from "../assets/send.svg";
import print from "../assets/print.svg";

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
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>Bill Journey Report</h2>
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
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Region</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Project Description</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Vendor Name</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Invoice Date</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Invoice Amount</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>Delay for Receiving Invoice</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>No. of Days at Site</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>No. of Days at Mumbai</th>
                                <th className='sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left'>No. of Days at A/c</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill, index) => (
                                <tr key={index} className="hover:bg-[#f5f5f5]">
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.srNo}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.region}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.projectDesc}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.vendorName}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-left'>{bill.invoiceDate}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.invoiceAmount}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.delayReceiving}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.daysSite}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.daysMumbai}</td>
                                    <td className='border border-black font-light text-[14px] py-[1.5vh] px-[1vw] text-right'>{bill.daysAccount}</td>
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
