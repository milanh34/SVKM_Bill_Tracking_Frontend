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
                    <table>
                        <thead>
                            <tr>
                                <th>SR. NO.</th>
                                <th>VENDOR NO</th>
                                <th>PROJECT DESCRIPTION</th>
                                <th>VENDOR NAME</th>
                                <th>TAX INVOICE NO.</th>
                                <th>TAX INVOICE AMOUNT</th>
                                <th>TAX INVOICE RECEIVED AT SITE</th>
                                <th>PO NO.</th>
                                <th>REGION</th>
                                <th>STATUS</th>
                                <th>REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.map((row) => (
                                <tr key={row.id}>
                                    <td>{row.id}</td>
                                    <td>{row.vendorNo}</td>
                                    <td>{row.projectDescription}</td>
                                    <td>{row.vendorName}</td>
                                    <td>{row.taxInvoiceNo}</td>
                                    <td>{row.taxInvoiceAmount.toFixed(2)}</td>
                                    <td>{row.taxInvoiceDate}</td>
                                    <td>{row.poNo}</td>
                                    <td>{row.region}</td>
                                    <td>
                                        <span className={`status-badge ${row.status.toLowerCase()}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td> <input readOnly /> </td>
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