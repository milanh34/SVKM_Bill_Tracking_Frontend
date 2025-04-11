import React, { useState } from 'react';
import "../styles/InvoiceTable.css";
import Header from '../components_tailwind/Header';
// import SendBox from '../components_tailwind/SendBox';
import Filters from "../components_tailwind/Filters";

const InvoiceTable = () => {
    // const [searchQuery, setSearchQuery] = useState("");
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
        <div className='invoice-table-page'>
            <Header />

            <div className="container">
                {
                    isWindowOpen && <div className="modal-overlay">
                    <div className="modal-content">
                      <label>Send to:</label>
                      <textarea className="modal-input"></textarea>
          
                      <label>Bills:</label>
                      <textarea className="modal-input modal-bills"></textarea>
          
                      <label>Remarks:</label>
                      <textarea className="modal-input"></textarea>
          
                      <div className="modal-buttons">
                        <button className="modal-button modal-close" onClick={closeWindow}>
                          Close
                        </button>
                        <button className="modal-button">Send</button>
                      </div>
                    </div>
                  </div>
                }
                <Filters />

                <div className="button-group">
                    <button className="action-button" onClick={openWindow}>Send to MIDOFFICE team</button>
                    <button className="action-button" onClick={openWindow}>Send to OS team</button>
                    <button className="action-button" onClick={openWindow}>Send to Store and Site team</button>
                    <button className="action-button" onClick={openWindow}>Send to Authorities</button>
                    <button className="action-button" onClick={openWindow}>Send to Accounts team</button>
                </div>

                <div className="invoice-table-container">
                    <table className='invoice-table-1'>
                        <thead>
                            <tr>
                                <th className='invoice-th'>Bill. NO.</th>
                                <th className='invoice-th'>SR. NO.</th>
                                <th className='invoice-th'>BILL DESCRIPTION</th>
                                <th className='invoice-th'>VENDOR NAME</th>
                                <th className='invoice-th'>TAX INVOICE AMOUNT</th>
                                <th className='invoice-th'>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.map((row) => (
                                <tr className='invoice-tr' key={row.id}>
                                    <td className='invoice-td'>{row.id}</td>
                                    <td className='invoice-td'>{row.srNo}</td>
                                    <td className='invoice-td'>{row.projectDescription}</td>
                                    <td className='invoice-td'>{row.vendorName}</td>
                                    
                                    <td className='invoice-td'>{row.taxInvAmt.toFixed(2)}</td>
                        
                                    <td className='invoice-td'>
                                        <span className={`status-badge ${row.status.toLowerCase()}`}>
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