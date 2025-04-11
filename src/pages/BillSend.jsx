import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import "../styles/Reports2.css";
import Filters from "../components/Filters";

const BillSend = () => {
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const mandatoryColumns = {
    srNo: "SR. NO.",
    vendorNo: "VENDOR NO.",
    vendorName: "VENDOR NAME",
    region: "REGION",
    taxInvoiceNo: "TAX INVOICE NO.",
    taxInvoiceDate: "TAX INVOICE DATE",
    taxInvoiceAmount: "TAX INVOICE AMOUNT",
    copAmount: "COP AMOUNT",
    qsAmount: "QS AMOUNT",
    poNo: "PO NO.",
  };

  const optionalColumns = {
    projectDescription: "PROJECT DESCRIPTION",
    status: "STATUS",
    department: "DEPARTMENT",
    location: "LOCATION",
    approver: "APPROVER",
  };

  const [selectedColumns, setSelectedColumns] = useState({
    ...Object.keys(mandatoryColumns).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    ),
    ...Object.keys(optionalColumns).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {}
    ),
  });

  const data = [...Array(9)].map((_, index) => ({
    id: index,
    srNo: 8736,
    vendorNo: `VN${1000 + index}`,
    vendorName: "Inner Space",
    region: "Mumbai",
    projectDescription: "MPSTME 8th floor",
    taxInvoiceNo: "SE/20/2024",
    taxInvoiceDate: "01.12.2024",
    taxInvoiceAmount: "8,055.15",
    copAmount: "7,500.00",
    qsAmount: "7,800.00",
    poNo: "8000010464",
    status: "Approved",
    department: "Engineering",
    location: "Building A",
    approver: "John Doe",
  }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsColumnDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedRows(selectAll ? [] : data.map((row) => row.id));
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  return (
    <div className="reports-page">
      <Header />
      <div className="report-outer">
        <div className="report-inner">
          <Filters />
          <div className="checklists">
            <button
              className="checklist-buttons"
              onClick={() => openModal("Send to MIGO/SES team")}
            >
              Send to MIGO/SES team
            </button>
            <button
              className="checklist-buttons"
              onClick={() => openModal("Send to QS team")}
            >
              Send to QS team
            </button>
            <button
              className="checklist-buttons"
              onClick={() => openModal("Send to Store and Site team")}
            >
              Send to Store and Site team
            </button>
            <button
              className="checklist-buttons"
              onClick={() => openModal("Send to Authorities")}
            >
              Send to Authorities
            </button>
            <button
              className="checklist-buttons"
              onClick={() => openModal("Send to Accounts team")}
            >
              Send to Accounts team
            </button>
          </div>
          <div className="view-container">
            <div className="report-select-all">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                id="selectAll"
              />
              <label htmlFor="selectAll">Select All</label>
            </div>
            <div className="column-selector" ref={dropdownRef}>
              <button
                className="column-dropdown-button"
                onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
              >
                Views
              </button>
              {isColumnDropdownOpen && (
                <div className="column-dropdown-content">
                  {Object.entries(optionalColumns).map(([key, label]) => (
                    <div key={key} className="column-option">
                      <input
                        type="checkbox"
                        checked={selectedColumns[key]}
                        onChange={() => handleColumnToggle(key)}
                        id={`col-${key}`}
                      />
                      <label htmlFor={`col-${key}`}>{label}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="table-wrapper">
            <div className="report-table-container">
              <table className="report-table">
                <thead>
                  <tr>
                    <th></th>
                    {Object.entries(mandatoryColumns).map(([key, label]) => (
                      <th key={key}>{label}</th>
                    ))}
                    {Object.entries(optionalColumns).map(
                      ([key, label]) =>
                        selectedColumns[key] && <th key={key}>{label}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                      {Object.keys(mandatoryColumns).map((key) => (
                        <td key={key} className="table-data">
                          {row[key]}
                        </td>
                      ))}
                      {Object.keys(optionalColumns).map(
                        (key) =>
                          selectedColumns[key] && (
                            <td key={key} className="table-data">
                              {row[key]}
                            </td>
                          )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <label>Send to:</label>
            <textarea className="modal-input"></textarea>

            <label>Bills:</label>
            <textarea className="modal-input modal-bills"></textarea>

            <label>Remarks:</label>
            <textarea className="modal-input"></textarea>

            <div className="modal-buttons">
              <button className="modal-button modal-close" onClick={closeModal}>
                Close
              </button>
              <button className="modal-button">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillSend;
