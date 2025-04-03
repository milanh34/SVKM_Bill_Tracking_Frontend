import "../styles/ContactTable.css";
import updownarrow from "../assets/updownarrow.svg";
import { useState } from "react";

const ContactsTable = () => {
  const [bills, setBills] = useState([{
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
    }]);

  return (
    <div className="contacts-table-container">
      <table className="contacts-table">
        <thead>
          <tr>
            <th>
              Bill No. 
            </th>
            <th>
              Sr. No. 
            </th>
            <th>
              Bill Description 
            </th>
            <th>
              Vendor Name
            </th>
            <th>
              Tax Invoice amount 
            </th>
            <th>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr className='invoice-tr' key={bill.id}>
            <td className='invoice-td'>{bill.id}</td>
            <td className='invoice-td'>{bill.srNo}</td>
            <td className='invoice-td'>{bill.projectDescription}</td>
            <td className='invoice-td'>{bill.vendorName}</td>
            
            <td className='invoice-td'>{bill.taxInvAmt.toFixed(2)}</td>

            <td className='invoice-td'>
                <span className={`status-badge ${bill.status.toLowerCase()}`}>
                    {bill.status}
                </span>
            </td>
        </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ContactsTable;