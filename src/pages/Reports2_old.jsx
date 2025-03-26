import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Header from "../components/Header";
import axios from "axios";
import { bills, report } from "../apis/bills.api";
import SendBox from "../components/Sendbox";
import { AgGridReact } from "ag-grid-react";
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  NumberFilterModule,
  PinnedRowModule,
  TextFilterModule,
  ValidationModule,
  ColumnAutoSizeModule,
  CellStyleModule,
} from "ag-grid-community";
import {
  ColumnMenuModule,
  ColumnsToolPanelModule,
  ContextMenuModule,
  RowGroupingModule,
  ExcelExportModule,
  SideBarModule,
} from "ag-grid-enterprise";

// Register AG Grid modules
ModuleRegistry.registerModules([
  TextFilterModule,
  PinnedRowModule,
  ClientSideRowModelModule,
  ColumnsToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  RowGroupingModule,
  NumberFilterModule,
  ValidationModule,
  ColumnAutoSizeModule,
  CellStyleModule,
  ExcelExportModule,
  SideBarModule,
]);

const Reports2 = () => {
  const gridRef = useRef();
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showColumnTool, setShowColumnTool] = useState(false);

  // Create a state for column definitions that can be updated
  const [allColumnDefs, setAllColumnDefs] = useState([
    { 
      headerName: "SR. NO.", 
      valueGetter: "node.rowIndex + 1", 
      width: 100, 
      filter: false,
      sortable: false
    },
    { 
      headerName: "PROJECT DESCRIPTION", 
      field: "projectDescription",
      minWidth: 250,
      filter: true
    },
    { 
      headerName: "VENDOR NO.", 
      field: "vendorNo",
      minWidth: 150
    },
    { 
      headerName: "VENDOR NAME", 
      field: "vendorName",
      minWidth: 200
    },
    { 
      headerName: "REGION", 
      field: "region",
      minWidth: 140,
      filter: true,
      enableRowGroup: true
    },
    { 
      headerName: "TAX INVOICE NO.", 
      field: "taxInvNo",
      minWidth: 180
    },
    { 
      headerName: "TAX INVOICE AMOUNT", 
      field: "taxInvAmt",
      minWidth: 200,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn'
    },
    { 
      headerName: "TAX INVOICE DATE", 
      field: "taxInvDate",
      minWidth: 180,
      filter: true,
      valueFormatter: (params) => {
        return params.value ? params.value.split("T")[0] : '';
      },
      sort: 'desc'
    },
    { 
      headerName: "PO NO.", 
      field: "poNo",
      minWidth: 150
    },
    { 
      headerName: "COP AMOUNT", 
      field: "copDetails.copAmount",
      minWidth: 170,
      valueGetter: (params) => {
        return params.data.copDetails ? 
          params.data.copDetails.copAmount || params.data.copDetails.amount : '';
      },
      filter: 'agNumberColumnFilter',
      type: 'numericColumn'
    },
    { 
      headerName: "QS AMOUNT", 
      field: "qsAmount",
      minWidth: 170,
      valueGetter: (params) => {
        return params.data.copDetails ? 
          params.data.copDetails.copAmount || params.data.copDetails.amount : '';
      },
      filter: 'agNumberColumnFilter',
      type: 'numericColumn'
    }
  ]);

  const roles = [
    { value: "Site_Officer", label: "Site Officer" },
    { value: "QS_Team", label: "QS Team" },
    { value: "PIMO_Mumbai_&_MIGO/SES_Team", label: "PIMO Mumbai & MIGO/SES Team" },
    { value: "PIMO_Mumbai_for_Advance_&_FI_Entry", label: "PIMO Mumbai for Advance & FI Entry" },
    { value: "Accounts_Team", label: "Accounts Team" },
    { value: "Trustee,_Advisor_&_Director", label: "Trustee, Advisor & Director" }
  ];

  const currentUserRole = localStorage.getItem("userRole");
  const availableRoles = roles.filter(role => role.value !== currentUserRole);

  const handleSendTo = (role) => {
    // If no rows selected, use all currently filtered data
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const billsToSend = selectedNodes.length === 0 
      ? gridRef.current.api.getModel().rowsToDisplay.map(row => row.data._id)
      : selectedNodes.map(node => node.data._id);
      
    setSelectedRole(role);
    setSelectedRows(billsToSend);
    setIsWindowOpen(true);
  };

  // Default column definitions - moved floatingFilter to false
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 150,
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: false, // Remove floating filters (search boxes)
      filterParams: {
        buttons: ['apply', 'reset', 'cancel'],
        closeOnApply: true
      },
      wrapHeaderText: true,
      autoHeaderHeight: true // Allow header text to wrap
    };
  }, []);

  // Side bar configuration
  const sideBar = useMemo(() => {
    return {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: false,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
            suppressColumnFilter: false,
            suppressColumnSelectAll: false,
          }
        }
      ],
      defaultToolPanel: '', // Hide by default
    };
  }, []);

  const popupParent = useMemo(() => {
    return document.body;
  }, []);

  // Check user authentication
  useEffect(() => {
    if (localStorage.getItem("userRole") === null) {
      window.location.href = "/login";
    }
  }, []);
  
  // Fetch bills data from backend
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get(bills);
        const filteredData = response.data.filter((bill) => bill.copDetails);
        setBillsData(filteredData);
        console.log("Bills data loaded:", filteredData.length, "records");
      } catch (error) {
        console.error("Error fetching bills:", error);
        setError("Failed to load data: " + error?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  // Function to generate dynamic columns
  const generateDynamicColumns = useCallback(() => {
    if (billsData.length > 0) {
      const sample = billsData[0];
      const additionalColumns = [];
      
      const processFields = (obj, prefix = "") => {
        Object.keys(obj).forEach((key) => {
          if (["_id", "createdAt", "updatedAt", "__v", "projectDescription", "vendorNo", 
               "vendorName", "region", "taxInvNo", "taxInvAmt", "taxInvDate", "poNo"].includes(key)) {
            return;
          }
          
          if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
            processFields(obj[key], prefix ? `${prefix}.${key}` : key);
          } else {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            const formattedLabel = fullKey
              .replace(/([A-Z])/g, " $1")
              .replace(/\./g, " ")
              .replace(/_/g, " ")
              .trim()
              .toUpperCase();
              
            // Avoid duplicate columns (already defined in main columnDefs)
            if (!allColumnDefs.find(col => col.field === fullKey)) {
              additionalColumns.push({
                headerName: formattedLabel,
                field: fullKey,
                minWidth: 180, // Increase minimum width
                valueGetter: (params) => {
                  return fullKey.includes(".")
                    ? fullKey
                        .split(".")
                        .reduce(
                          (obj, prop) =>
                            obj && obj[prop] !== undefined
                              ? obj[prop]
                              : "",
                          params.data
                        )
                    : params.data[fullKey] || "";
                },
                hide: true // Hide additional columns by default
              });
            }
          }
        });
      };
      
      if (sample) {
        processFields(sample);
        
        // Update column definitions state instead of using API directly
        if (additionalColumns.length > 0) {
          setAllColumnDefs(prevColumns => [...prevColumns, ...additionalColumns]);
        }
      }
    }
  }, [billsData, allColumnDefs]);

  // Update dynamic columns when data is loaded
  useEffect(() => {
    if (!loading && billsData.length > 0) {
      generateDynamicColumns();
    }
  }, [loading, billsData, generateDynamicColumns]);

  const handleDownloadReport = async () => {
    let billIdsToDownload = [];
    const selectedNodes = gridRef.current.api.getSelectedNodes();

    if (selectedNodes.length === 0) {
      // Get all currently visible/filtered rows
      billIdsToDownload = gridRef.current.api.getModel().rowsToDisplay.map(row => row.data._id);
      
      if (billIdsToDownload.length > 0) {
        if (!window.confirm(`No bills selected. Download all ${billIdsToDownload.length} filtered bills?`)) {
          return;
        }
      } else {
        alert("No bills available to download.");
        return;
      }
    } else {
      billIdsToDownload = selectedNodes.map(node => node.data._id);
    }
  
    try {
      const response = await axios.post(
        report,
        { billIds: billIdsToDownload, format: "excel" },
        { responseType: "blob" }
      );
      
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the report:", error);
      alert("Failed to download report: " + (error.message || "Unknown error"));
    }
  };

  // Export directly to Excel
  const handleExportToExcel = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      const params = {
        fileName: 'bills-export.xlsx',
        sheetName: 'Bills',
      };
      gridRef.current.api.exportDataAsExcel(params);
    }
  }, []);

  // Toggle column tool panel
  const toggleColumnTool = useCallback(() => {
    setShowColumnTool(prev => !prev);
    
    if (gridRef.current && gridRef.current.api) {
      if (!showColumnTool) {
        gridRef.current.api.openToolPanel('columns');
      } else {
        gridRef.current.api.closeToolPanel();
      }
    }
  }, [showColumnTool]);

  const onGridReady = useCallback((params) => {
    // Auto-size the columns on grid ready
    if (params.columnApi.autoSizeAllColumns) {
      setTimeout(() => {
        params.columnApi.autoSizeAllColumns();
      }, 1000);
    }
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    // Auto-size the columns once data is loaded
    if (params.columnApi.autoSizeAllColumns) {
      params.columnApi.autoSizeAllColumns();
    }
  }, []);

  const onSelectionChanged = useCallback(() => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    setSelectedRows(selectedNodes.map(node => node.data._id));
  }, []);

  return (
    <div className="bg-white text-black min-h-screen font-sans">
      <Header />
      <div className="p-4 pt-0 h-full bg-white">
        <div className="bg-gray-100 p-4 rounded-xl h-full">
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 w-full box-border mb-4">
            {availableRoles.map(role => (
              <button 
                key={role.value} 
                className="py-2 px-4 border-none rounded bg-green-700 hover:bg-green-800 text-white cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis text-sm transition-colors"
                onClick={() => handleSendTo(role)}
              >
                Send to {role.label}
              </button>
            ))}
          </div>
          
          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium text-sm border-none outline-none cursor-pointer flex items-center gap-2"
              onClick={toggleColumnTool}
            >
              {showColumnTool ? 'Hide Column Tool' : 'Show Column Tool'}
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M3 9h18M3 15h18M9 3v18M15 3v18" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            
            <button
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium text-sm border-none outline-none cursor-pointer flex items-center gap-2"
              onClick={handleExportToExcel}
            >
              Export to Excel
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M14 3v4a1 1 0 001 1h4M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M9 17l2-2 2 2M11 15v-4" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          
          {/* Grid Container */}
          <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
            {loading ? (
              <p className="font-semibold text-lg text-gray-500 p-4">Loading data...</p>
            ) : error ? (
              <p className="font-semibold text-lg text-red-500 p-4">{error}</p>
            ) : (
              <AgGridReact
                ref={gridRef}
                rowData={billsData}
                columnDefs={allColumnDefs}
                defaultColDef={defaultColDef}
                popupParent={popupParent}
                onGridReady={onGridReady}
                onFirstDataRendered={onFirstDataRendered}
                rowSelection="multiple"
                onSelectionChanged={onSelectionChanged}
                suppressRowClickSelection={false}
                animateRows={true}
                enableCellTextSelection={true}
                pagination={true}
                paginationPageSize={100}
                rowHeight={48}
                sideBar={sideBar}
                suppressMenuHide={true} // Always show column menu button
                enableRangeSelection={true} // Enable range selection for Excel-like experience
              />
            )}
          </div>
          
          {/* Download Buttons */}
          <div className="flex justify-end bg-transparent pt-4 gap-2">
            <button
              className="bg-indigo-700 hover:bg-indigo-800 text-white py-2.5 px-4 rounded-xl font-medium text-sm border-none outline-none cursor-pointer flex items-center gap-2"
              onClick={handleDownloadReport}
            >
              Download Report
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="bg-transparent"
              >
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Send Dialog */}
      {isWindowOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <SendBox
            closeWindow={() => {
              setIsWindowOpen(false);
              setSelectedRole(null);
            }}
            selectedBills={selectedRows}
            billsData={billsData}
            singleRole={selectedRole}
          />
        </div>
      )}
    </div>
  );
};

export default Reports2;