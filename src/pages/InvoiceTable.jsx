import React, { useState } from 'react';
import "../styles/InvoiceTable.css";
import Header from '../components/Header';
// import SendBox from '../components/SendBox';
import Filters from "../components/Filters"

const InvoiceTable = () => {
    // const [searchQuery, setSearchQuery] = useState("");
    const[isWindowOpen, setIsWindowOpen] = useState(false);

    const invoiceData = [
        {
            id: 1,
            vendorNo: "834440",
            projectDescription: "MPSTME 8th floor",
            vendorName: "Inner Space",
            taxInvoiceNo: "GST/0525/906",
            taxInvoiceAmount: 42834.0,
            taxInvoiceDate: "8,055.15",
            poNo: "B000010484",
            region: "Mumbai",
            status: "Active",
            remarks: "",
        },
        {
            id: 1,
            vendorNo: "834440",
            projectDescription: "MPSTME 8th floor",
            vendorName: "Inner Space",
            taxInvoiceNo: "GST/0525/906",
            taxInvoiceAmount: 42834.0,
            taxInvoiceDate: "8,055.15",
            poNo: "B000010484",
            region: "Mumbai",
            status: "Active",
            remarks: "",
        },
        {
            id: 1,
            vendorNo: "834440",
            projectDescription: "MPSTME 8th floor",
            vendorName: "Inner Space",
            taxInvoiceNo: "GST/0525/906",
            taxInvoiceAmount: 42834.0,
            taxInvoiceDate: "8,055.15",
            poNo: "B000010484",
            region: "Mumbai",
            status: "Active",
            remarks: "",
        },
        {
            id: 1,
            vendorNo: "834440",
            projectDescription: "MPSTME 8th floor",
            vendorName: "Inner Space",
            taxInvoiceNo: "GST/0525/906",
            taxInvoiceAmount: 42834.0,
            taxInvoiceDate: "8,055.15",
            poNo: "B000010484",
            region: "Mumbai",
            status: "inactive",
            remarks: "",
        },
        {
            id: 1,
            vendorNo: "834440",
            projectDescription: "MPSTME 8th floor",
            vendorName: "Inner Space",
            taxInvoiceNo: "GST/0525/906",
            taxInvoiceAmount: 42834.0,
            taxInvoiceDate: "8,055.15",
            poNo: "B000010484",
            region: "Mumbai",
            status: "Active",
            remarks: "",
        },
    ];

    const openWindow = () =>{
        setIsWindowOpen(true);
    }

    const closeWindow = () =>{
        setIsWindowOpen(false);
    }

    return (
        <div>
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
                                <th className='invoice-th'>SR. NO.</th>
                                <th className='invoice-th'>VENDOR NO</th>
                                <th className='invoice-th'>PROJECT DESCRIPTION</th>
                                <th className='invoice-th'>VENDOR NAME</th>
                                <th className='invoice-th'>TAX INVOICE NO.</th>
                                <th className='invoice-th'>TAX INVOICE AMOUNT</th>
                                <th className='invoice-th'>TAX INVOICE RECEIVED AT SITE</th>
                                <th className='invoice-th'>PO NO.</th>
                                <th className='invoice-th'>REGION</th>
                                <th className='invoice-th'>STATUS</th>
                                <th className='invoice-th'>REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.map((row) => (
                                <tr className='invoice-tr' key={row.id}>
                                    <td className='invoice-td'>{row.id}</td>
                                    <td className='invoice-td'>{row.vendorNo}</td>
                                    <td className='invoice-td'>{row.projectDescription}</td>
                                    <td className='invoice-td'>{row.vendorName}</td>
                                    <td className='invoice-td'>{row.taxInvoiceNo}</td>
                                    <td className='invoice-td'>{row.taxInvoiceAmount.toFixed(2)}</td>
                                    <td className='invoice-td'>{row.taxInvoiceDate}</td>
                                    <td className='invoice-td'>{row.poNo}</td>
                                    <td className='invoice-td'>{row.region}</td>
                                    <td className='invoice-td'>
                                        <span className={`status-badge ${row.status.toLowerCase()}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className='invoice-td'> <input readOnly /> </td>
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