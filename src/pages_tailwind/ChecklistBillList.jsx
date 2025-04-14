import React, { useRef, useState } from 'react';
import Header from '../components/Header';
import { useLocation, useNavigate } from "react-router-dom";
import print from "../assets/print.svg";
import Checklist from '../pages_tailwind/AdvancedChecklist';

const ITEMS_PER_PAGE = 1;

const ChecklistBillList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const billList = location.state?.selectedRows || [];

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(billList.length / ITEMS_PER_PAGE);
  const printRef = useRef();

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open('', '', 'width=800,height=600');
    
    // Add CSS for page breaks
    const pageBreakStyle = `
      <style>
        @media print {
          .checklist-page {
            page-break-after: always;
          }
          .checklist-page:last-child {
            page-break-after: auto;
          }
        }
      </style>
    `;
    
    win.document.write('<html><head><title>Print Checklist</title>');
    win.document.write(pageBreakStyle);
    win.document.write('</head><body>');
    win.document.write(printContent);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = billList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      <Header />

      <div className='flex items-center justify-between px-20 mt-5'>
        <button
          className='btn print'
          onClick={handlePrint}
          style={{
            width: 'fit-content',
            padding: '1vh 2vw',
            display: 'flex',
            alignItems: 'center',
            background: '#208AF0',
            marginLeft: 'auto',
            gap: '10px'
          }}
        >
          Print All Checklist <img src={print} alt="Print Icon" />
        </button>
      </div>

      {/* Visible paginated checklists */}
      <div className='w-fit flex flex-col gap-4 items-center'>
        {
          currentItems.map((item, index) => (
            <Checklist key={index} billID={item} />
          ))
        }
      </div>

      {/* Hidden checklist print container */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {
            billList.map((item, index) => (
              <div key={index} className="checklist-page">
                <Checklist billID={item} />
              </div>
            ))
          }
        </div>
      </div>

      {/* Pagination controls */}
      {
        totalPages > 1 && (
          <div className='flex justify-center items-center gap-4 mt-6 mb-6'>
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className='btn px-4 py-2 bg-[#0047ab] rounded disabled:opacity-50'
            >
              Prev
            </button>
            <span className='text-lg'>{currentPage} / {totalPages}</span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className='btn px-4 py-2 bg-[#0047ab] rounded disabled:opacity-50'
            >
              Next
            </button>
          </div>
        )
      }
    </div>
  );
};

export default ChecklistBillList;