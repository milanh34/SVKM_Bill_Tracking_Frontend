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
    <div className="w-[95%] flex justify-center mx-auto my-[10vh] overflow-x-auto">
      <table className="w-full box-border table-fixed overflow-x-auto min-w-0">
        <thead>
          <tr>
            <th className="w-auto p-3 text-left border-b border-[#e0e0e0] bg-white font-bold text-[#333]">
              Bill No. 
            </th>
            <th className="w-auto p-3 text-left border-b border-[#e0e0e0] bg-white font-bold text-[#333]">
              Sr. No. 
            </th>
            <th className="w-auto p-3 text-left border-b border-[#e0e0e0] bg-white font-bold text-[#333]">
              Bill Description 
            </th>
            <th className="w-auto p-3 text-left border-b border-[#e0e0e0] bg-white font-bold text-[#333]">
              Vendor Name
            </th>
            <th className="w-auto p-3 text-left border-b border-[#e0e0e0] bg-white font-bold text-[#333]">
              Tax Invoice amount 
            </th>
            <th className="w-auto p-3 text-left border-b border-[#e0e0e0] bg-white font-bold text-[#333]">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr key={bill.id} className="bg-white hover:bg-gray-50">
              <td className="w-auto p-3 text-left border-b border-[#e0e0e0] break-words overflow-hidden box-border">
                {bill.id}
              </td>
              <td className="w-auto p-3 text-left border-b border-[#e0e0e0] break-words overflow-hidden box-border">
                {bill.srNo}
              </td>
              <td className="w-auto p-3 text-left border-b border-[#e0e0e0] break-words overflow-hidden box-border">
                {bill.projectDescription}
              </td>
              <td className="w-auto p-3 text-left border-b border-[#e0e0e0] break-words overflow-hidden box-border">
                {bill.vendorName}
              </td>
              <td className="w-auto p-3 text-left border-b border-[#e0e0e0] break-words overflow-hidden box-border">
                {bill.taxInvAmt.toFixed(2)}
              </td>
              <td className="w-auto p-3 text-left border-b border-[#e0e0e0] break-words overflow-hidden box-border">
                <span className={`px-2 py-1 rounded-md text-sm font-semibold
                  ${bill.status.toLowerCase() === 'accept' ? 'bg-[#e3f2fd] text-[#1976d2]' : 
                  bill.status.toLowerCase() === 'reject' ? 'bg-[#ffebee] text-[#d32f2f]' : 
                  'bg-[#fff9c4] text-[#f57f17]'}`}>
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