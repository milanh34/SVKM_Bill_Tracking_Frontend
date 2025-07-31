import React, { useState } from 'react';
import Header from '../../components/Header';
import Filters from "../../components/Filters";

const InvoiceTable = () => {
    const[isWindowOpen, setIsWindowOpen] = useState(false);

    const invoiceData = [{
        id: 1,
        srNo: 123,
        projectDescription: 'hello',
        vendorName: 'Milan',
        taxInvAmt: 10890.00,
        status: "accept"
    },
    {
        id: 1,
        srNo: 123,
        projectDescription: 'hello',
        vendorName: 'Milan',
        taxInvAmt: 10890.00,
        status: "accept"
    },
    {
        id: 1,
        srNo: 123,
        projectDescription: 'hello',
        vendorName: 'Milan',
        taxInvAmt: 10890.00,
        status: "accept"
    },
    {
        id: 1,
        srNo: 123,
        projectDescription: 'hello',
        vendorName: 'Milan',
        taxInvAmt: 10890.00,
        status: "accept"
    },
    {
        id: 1,
        srNo: 123,
        projectDescription: 'hello',
        vendorName: 'Milan',
        taxInvAmt: 10890.00,
        status: "accept"
    },
    {
        id: 1,
        srNo: 123,
        projectDescription: 'hello',
        vendorName: 'Milan',
        taxInvAmt: 10890.00,
        status: "accept"
    }
];

    const openWindow = () =>{
        setIsWindowOpen(true);
    }

    const closeWindow = () =>{
        setIsWindowOpen(false);
    }

    return (
        <div className='min-h-screen bg-[#f0f0f0]'>
            <Header />

            <div className="p-5 h-fit bg-[#f0f0f0] box-border overflow-x-hidden min-w-full">
                {isWindowOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-[500px]">
                            <label className="block mb-2">Send to:</label>
                            <textarea className="w-full p-2 border rounded mb-4"></textarea>

                            <label className="block mb-2">Bills:</label>
                            <textarea className="w-full p-2 border rounded mb-4 h-[100px]"></textarea>

                            <label className="block mb-2">Remarks:</label>
                            <textarea className="w-full p-2 border rounded mb-4"></textarea>

                            <div className="flex justify-end gap-4">
                                <button className="px-4 py-2 bg-gray-200 rounded" onClick={closeWindow}>
                                    Close
                                </button>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
                            </div>
                        </div>
                    </div>
                )}
                <Filters />

                <div className="flex flex-wrap gap-3 mb-5 w-full bg-[#f0f0f0]">
                    <button className="px-4 py-2 bg-[#3c51b9] text-white border-none rounded-[15px] cursor-pointer text-sm whitespace-nowrap hover:bg-[#1e2c73]" onClick={openWindow}>Send to MIDOFFICE team</button>
                    <button className="px-4 py-2 bg-[#3c51b9] text-white border-none rounded-[15px] cursor-pointer text-sm whitespace-nowrap hover:bg-[#1e2c73]" onClick={openWindow}>Send to OS team</button>
                    <button className="px-4 py-2 bg-[#3c51b9] text-white border-none rounded-[15px] cursor-pointer text-sm whitespace-nowrap hover:bg-[#1e2c73]" onClick={openWindow}>Send to Store and Site team</button>
                    <button className="px-4 py-2 bg-[#3c51b9] text-white border-none rounded-[15px] cursor-pointer text-sm whitespace-nowrap hover:bg-[#1e2c73]" onClick={openWindow}>Send to Authorities</button>
                    <button className="px-4 py-2 bg-[#3c51b9] text-white border-none rounded-[15px] cursor-pointer text-sm whitespace-nowrap hover:bg-[#1e2c73]" onClick={openWindow}>Send to Accounts team</button>
                </div>

                <div className="w-screen overflow-x-scroll border border-white rounded">
                    <table className='w-full border-collapse min-w-[80vw]'>
                        <thead>
                            <tr>
                                <th className='p-2 text-left border-b border-[#ddd] bg-[#f8f9fa] font-semibold whitespace-nowrap'>Bill. NO.</th>
                                <th className='p-2 text-left border-b border-[#ddd] bg-[#f8f9fa] font-semibold whitespace-nowrap'>SR. NO.</th>
                                <th className='p-2 text-left border-b border-[#ddd] bg-[#f8f9fa] font-semibold whitespace-nowrap'>BILL DESCRIPTION</th>
                                <th className='p-2 text-left border-b border-[#ddd] bg-[#f8f9fa] font-semibold whitespace-nowrap'>VENDOR NAME</th>
                                <th className='p-2 text-left border-b border-[#ddd] bg-[#f8f9fa] font-semibold whitespace-nowrap'>TAX INVOICE AMOUNT</th>
                                <th className='p-2 text-left border-b border-[#ddd] bg-[#f8f9fa] font-semibold whitespace-nowrap'>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.map((row) => (
                                <tr key={row.id} className='hover:bg-[#f5f5f5]'>
                                    <td className='p-2 text-left border-b border-[#ddd]'>{row.id}</td>
                                    <td className='p-2 text-left border-b border-[#ddd]'>{row.srNo}</td>
                                    <td className='p-2 text-left border-b border-[#ddd]'>{row.projectDescription}</td>
                                    <td className='p-2 text-left border-b border-[#ddd]'>{row.vendorName}</td>
                                    <td className='p-2 text-left border-b border-[#ddd]'>{row.taxInvAmt?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className='p-2 text-left border-b border-[#ddd]'>
                                        <span className={`px-2 py-1 rounded-xl text-xs font-medium ${
                                            row.status.toLowerCase() === 'accept' 
                                                ? 'bg-[#e6f4ea] text-[#1e7e34]' 
                                                : 'bg-[#fce8e8] text-[#dc3545]'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTable;