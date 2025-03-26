import React, { useState, useEffect, useMemo, useRef } from 'react';
import { EditIcon, SortAscIcon, SortDescIcon } from './Icons';
import { MoreVertical, GripVertical } from 'lucide-react';

const DataTable = ({ 
  data,  // this is the paginated data
  allData, // Add this new prop to receive all filtered data
  defaultColumns,
  availableColumns,
  visibleColumnFields,
  onEdit,
  onRowSelect,
  onSort,
  sortConfig
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [columnMenuOpen, setColumnMenuOpen] = useState(null);
  const [pinnedColumns, setPinnedColumns] = useState([]);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [columnOrder, setColumnOrder] = useState([]);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dragDirection, setDragDirection] = useState(null); // 'left' or 'right'
  const menuRef = useRef(null);

  // Get visible columns by comparing field IDs with available columns
  const visibleColumns = useMemo(() => {
    return availableColumns.filter(col => visibleColumnFields.includes(col.field));
  }, [availableColumns, visibleColumnFields]);

  // Initialize column order
  useEffect(() => {
    if (visibleColumnFields.length > 0 && columnOrder.length === 0) {
      setColumnOrder(visibleColumnFields);
    }
  }, [visibleColumnFields]);

  // Update selected rows state when rows are selected/deselected
  useEffect(() => {
    if (onRowSelect) {
      onRowSelect(selectedRows);
    }
  }, [selectedRows, onRowSelect]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setColumnMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to get nested value from an object
  const getNestedValue = (obj, path) => {
    if (!obj || !path) return '';
    
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        value = '';
        break;
      }
    }
    
    // Handle specific data types
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // Handle null/undefined
    if (value === null || value === undefined) {
      return '';
    }
    
    return value;
  };

  // Handle column pinning
  const handlePinColumn = (field, position) => {
    setPinnedColumns(prev => {
      const filtered = prev.filter(pin => pin.field !== field);
      if (position) {
        return [...filtered, { field, position }];
      }
      return filtered;
    });
    setColumnMenuOpen(null);
  };

  // Handle column drag and drop
  const handleDragStart = (e, field) => {
    e.dataTransfer.setData('text/plain', field);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedColumn(field);
    
    // Add drag styling
    e.target.classList.add('dragging');
  };

  const handleDragOver = (e, field) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedColumn || draggedColumn === field) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const direction = x < rect.width / 2 ? 'left' : 'right';
    
    setDragOverColumn(field);
    setDragDirection(direction);
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === field) return;

    const newOrder = [...columnOrder];
    const draggedIdx = newOrder.indexOf(draggedColumn);
    const dropIdx = newOrder.indexOf(field);
    
    // Remove dragged column
    newOrder.splice(draggedIdx, 1);
    
    // Insert at new position based on drop direction
    const insertIdx = dragDirection === 'right' ? dropIdx : dropIdx - 1;
    newOrder.splice(insertIdx + 1, 0, draggedColumn);
    
    setColumnOrder(newOrder);
    setDraggedColumn(null);
    setDragOverColumn(null);
    setDragDirection(null);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedColumn(null);
    setDragOverColumn(null);
    setDragDirection(null);
  };

  // Apply sorting to the data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;
    
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // Try to parse dates from strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sortConfig.direction === 'asc' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
      }
      
      // Default string comparison
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      
      if (aString < bString) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aString > bString) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Format date values
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  };

  // Format currency values
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Handle row selection
  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Modify handleSelectAll to use allData instead of just current page data
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allData.map(row => row._id));
    }
    setSelectAll(!selectAll);
  };

  // Format cell value based on field type
  const formatCellValue = (value, field) => {
    if (value === undefined || value === null) return '-';
    
    // Format dates
    if (field.includes('date') || field.includes('Date') || field.endsWith('Dt') || field.endsWith('_dt')) {
      return formatDate(value);
    }
    
    // Format currency/amounts
    if (field.includes('amount') || field.includes('Amount') || field.includes('Amt') || field.includes('_amt')) {
      if (typeof value === 'number') {
        return formatCurrency(value);
      }
    }
    
    return value.toString();
  };

  // Get status cell styles
  const getStatusStyle = (status) => {
    if (!status) return {};
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approve') || statusLower === 'paid' || statusLower === 'active') {
      return { color: '#15803d', fontWeight: 'bold' };
    } else if (statusLower.includes('reject') || statusLower === 'fail') {
      return { color: '#b91c1c', fontWeight: 'bold' };
    } else if (statusLower.includes('pend') || statusLower === 'waiting') {
      return { color: '#ca8a04', fontWeight: 'bold' };
    }
    return {};
  };

  // Update visible columns based on order and pinned state
  const orderedVisibleColumns = useMemo(() => {
    // Checkbox column is always pinned left
    const pinnedLeft = visibleColumns.filter(col => 
      pinnedColumns.find(pin => pin.field === col.field && pin.position === 'left')
    );
    
    const pinnedRight = visibleColumns.filter(col => 
      pinnedColumns.find(pin => pin.field === col.field && pin.position === 'right')
    );
    
    const unpinned = visibleColumns.filter(col => 
      !pinnedColumns.find(pin => pin.field === col.field)
    );
    
    // Use columnOrder to maintain the order of unpinned columns
    const orderedUnpinned = [...columnOrder]
      .map(field => unpinned.find(col => col.field === field))
      .filter(Boolean);
    
    return [...pinnedLeft, ...orderedUnpinned, ...pinnedRight];
  }, [visibleColumns, pinnedColumns, columnOrder]);

  // Column menu content with improved styling
  const ColumnMenu = ({ field, onClose }) => (
    <div 
      className="fixed transform translate-y-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100]"
      ref={menuRef}
      onClick={(e) => e.stopPropagation()} // Add this to prevent click propagation
      style={{
        top: menuRef.current?.parentElement?.getBoundingClientRect().bottom,
        left: menuRef.current?.parentElement?.getBoundingClientRect().left
      }}
    >
      <div className="px-4 py-2 text-sm font-semibold border-b border-gray-200">
        Column Options
      </div>
      
      <div className="py-1">
        <button
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          onClick={() => {
            requestSort(field);
            onClose();
          }}
        >
          <span>Sort {sortConfig.key === field ? 
            (sortConfig.direction === 'asc' ? 'Descending' : 'None') : 
            'Ascending'}</span>
        </button>
      </div>
      
      <div className="border-t border-gray-200 py-1">
        <button
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          onClick={() => handlePinColumn(field, 'left')}
        >
          Pin Left
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          onClick={() => handlePinColumn(field, 'right')}
        >
          Pin Right
        </button>
        <button
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          onClick={() => handlePinColumn(field, null)}
        >
          Unpin
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-[41] bg-gray-50"> {/* Increased z-index */}
          <tr>
            {/* Checkbox header - always pinned left */}
            <th 
              className="sticky left-0 z-[42] w-10 p-3 text-center border-b border-gray-200 bg-gray-50"
              onClick={(e) => e.stopPropagation()} // Add this to prevent propagation
            >
              <input
                type="checkbox"
                checked={selectAll || (selectedRows.length > 0 && selectedRows.length === allData.length)}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              />
            </th>
            
            {/* Column headers */}
            {orderedVisibleColumns.map(column => (
              <th 
                key={column.field}
                className={`p-3 text-left font-semibold text-gray-700 cursor-pointer whitespace-nowrap relative border-b border-gray-200
                  ${sortConfig.key === column.field ? 'bg-gray-100' : ''}
                  ${pinnedColumns.find(pin => pin.field === column.field && pin.position === 'left') ? 'sticky left-10 z-[40] bg-gray-50' : ''}
                  ${pinnedColumns.find(pin => pin.field === column.field && pin.position === 'right') ? 'sticky right-0 z-[40] bg-gray-50' : ''}
                  ${dragOverColumn === column.field ? 'drop-target' : ''}
                  ${dragOverColumn === column.field && dragDirection === 'left' ? 'drop-left' : ''}
                  ${dragOverColumn === column.field && dragDirection === 'right' ? 'drop-right' : ''}
                `}
                data-field={column.field}
                draggable
                onDragStart={(e) => handleDragStart(e, column.field)}
                onDragOver={(e) => handleDragOver(e, column.field)}
                onDrop={(e) => handleDrop(e, column.field)}
                onDragEnd={handleDragEnd}
                onDragEnter={(e) => e.preventDefault()}
                onClick={(e) => {
                  // Only sort if click is not on a button or input
                  if (!['BUTTON', 'INPUT'].includes(e.target.tagName)) {
                    onSort(column.field);
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2 group">
                  <div className="flex items-center gap-2 flex-1">
                    <GripVertical 
                      size={16}
                      className="opacity-0 group-hover:opacity-50 cursor-grab"
                    />
                    <span>{column.headerName}</span>
                    {sortConfig.key === column.field && sortConfig.direction && (
                      <span className="flex items-center">
                        {sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />}
                      </span>
                    )}
                  </div>
                  
                  <button
                    className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation(); // Add this to prevent sort trigger
                      setColumnMenuOpen(columnMenuOpen === column.field ? null : column.field);
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  
                  {columnMenuOpen === column.field && (
                    <ColumnMenu 
                      field={column.field} 
                      onClose={() => setColumnMenuOpen(null)} 
                    />
                  )}
                </div>
              </th>
            ))}
            
            {/* Actions header - always pinned right */}
            <th className="sticky right-0 z-[42] w-14 p-3 text-center border-b border-gray-200 bg-gray-50">
              Actions
            </th>
          </tr>
        </thead>
        
        {/* Table body */}
        <tbody>
          {sortedData.map((row) => {
            const isSelected = selectedRows.includes(row._id);
            
            return (
              <tr 
                key={row._id} 
                className={`border-b border-gray-200 hover:bg-blue-50 transition-colors
                  ${isSelected ? 'bg-blue-50' : 'bg-white'}
                `}
              >
                {/* Checkbox cell - always pinned left */}
                <td className="sticky left-0 z-[32] w-10 p-3 text-center bg-inherit border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleRowSelect(row._id)}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                </td>
                
                {orderedVisibleColumns.map(column => {
                  const value = getNestedValue(row, column.field);
                  const formattedValue = formatCellValue(value, column.field);
                  const cellStyle = column.field.includes('status') ? getStatusStyle(value) : {};
                  const isPinnedLeft = pinnedColumns.find(pin => pin.field === column.field && pin.position === 'left');
                  const isPinnedRight = pinnedColumns.find(pin => pin.field === column.field && pin.position === 'right');
                  
                  return (
                    <td 
                      key={column.field} 
                      className={`p-3 whitespace-nowrap ${
                        column.field.includes('amount') ? 'text-right' : ''
                      } ${isPinnedLeft ? 'sticky left-10 z-[30] bg-inherit' : ''
                      } ${isPinnedRight ? 'sticky right-0 z-[30] bg-inherit' : ''
                      }`}
                      style={cellStyle}
                      data-field={column.field}
                    >
                      {formattedValue}
                    </td>
                  );
                })}
                
                {/* Actions cell - always pinned right */}
                <td className="sticky right-0 z-[32] w-14 p-3 text-center bg-inherit border-b border-gray-200">
                  <button 
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => onEdit && onEdit(row)}
                  >
                    <EditIcon />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;