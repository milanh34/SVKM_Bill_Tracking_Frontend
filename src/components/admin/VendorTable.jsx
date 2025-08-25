import React, { useState, useEffect } from 'react';
import { EditIcon, CheckIcon } from '../Icons';
import { vendors, compliances, panstatus } from '../../apis/master.api';
import { importVendors, updateVendors } from '../../apis/excel.api';
import { handleExportVendorMaster } from '../../utils/exportDownloadVendorMaster';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';
import importVendorTemplate from '../../assets/importVendor.xlsx?url';
import updateVendorTemplate from '../../assets/updateVendor.xlsx?url';

const VendorTable = () => {
    const [vendorData, setVendorData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRow, setEditingRow] = useState(null);
    const [editedValues, setEditedValues] = useState({});

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVendor, setNewVendor] = useState({
        vendorName: '',
        vendorNo: '',
        PAN: '',
        GSTNumber: '',
        complianceStatus: '',
        PANStatus: '',
        emailIds: [],
        phoneNumbers: [],
        addl1: '',
        addl2: ''
    });
    const [showImportModal, setShowImportModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedImportFile, setSelectedImportFile] = useState(null);
    const [selectedUpdateFile, setSelectedUpdateFile] = useState(null);

    // Dropdown options states
    const [complianceOptions, setComplianceOptions] = useState([]);
    const [panStatusOptions, setPanStatusOptions] = useState([]);

    // Fetch vendors and dropdown options on component mount
    useEffect(() => {
        fetchVendors();
        fetchDropdownOptions();
    }, []);

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await axios.get(vendors, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendorData(response.data);
            setFilteredData(response.data);
        } catch (error) {
            console.error("Error fetching vendors:", error);
            toast.error('Failed to fetch vendors');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDropdownOptions = async () => {
        try {
            const token = Cookies.get("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [compliancesRes, panStatusRes] = await Promise.all([
                axios.get(compliances, { headers }),
                axios.get(panstatus, { headers })
            ]);

            setComplianceOptions(compliancesRes.data);
            setPanStatusOptions(panStatusRes.data);
        } catch (error) {
            console.error("Error fetching dropdown options:", error);
            toast.error('Failed to fetch dropdown options');
        }
    };

    // Search functionality
    useEffect(() => {
        if (!searchTerm) {
            setFilteredData(vendorData);
            return;
        }

        const lowerSearch = searchTerm.toLowerCase();

        const filtered = vendorData.filter(v =>
            (v.vendorNo?.toString().toLowerCase().includes(lowerSearch)) ||
            (v.vendorName?.toLowerCase().includes(lowerSearch)) ||
            (v.PAN?.toLowerCase().includes(lowerSearch)) ||
            (v.GSTNumber?.toLowerCase().includes(lowerSearch)) ||
            (v.complianceStatus?.toLowerCase().includes(lowerSearch)) ||
            (v.PANStatus?.toLowerCase().includes(lowerSearch)) ||
            (Array.isArray(v.emailIds) && v.emailIds.join(', ').toLowerCase().includes(lowerSearch)) ||
            (Array.isArray(v.phoneNumbers) && v.phoneNumbers.join(', ').toLowerCase().includes(lowerSearch)) ||
            (v.addl1?.toLowerCase().includes(lowerSearch)) ||
            (v.addl2?.toLowerCase().includes(lowerSearch))
        );

        setFilteredData(filtered);
    }, [searchTerm, vendorData]);

    // Escape key handler
    useEffect(() => {
        const handleGlobalEscape = (event) => {
            if (event.key === 'Escape' && editingRow) {
                setEditingRow(null);
                setEditedValues(prev => {
                    const newValues = { ...prev };
                    delete newValues[editingRow];
                    return newValues;
                });
            }
        };

        window.addEventListener('keydown', handleGlobalEscape);
        return () => window.removeEventListener('keydown', handleGlobalEscape);
    }, [editingRow]);

    const handleCellEdit = (field, value, rowId) => {
        setEditedValues(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [field]: value
            }
        }));
    };

    const handleEditClick = (vendor) => {
        if (editingRow === vendor._id) {
            const editedFieldsForRow = editedValues[vendor._id];
            // validateVendorNo(vendor.vendorNo);
            if (editedFieldsForRow.vendorNo && !validateVendorNo(editedFieldsForRow.vendorNo)) {
                toast.error('Vendor Number should be 6 digits');
                return;
            }
            if (!editedFieldsForRow) {
                setEditingRow(null);
                return;
            }

            const token = Cookies.get("token");
            axios.put(`${vendors}/${vendor._id}`, editedFieldsForRow, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(() => {
                    fetchVendors();
                    toast.success('Vendor updated successfully!');
                })
                .catch(error => {
                    console.error("Edit error:", error);
                    toast.error(error.response?.data?.error || 'Failed to update vendor');
                })
                .finally(() => {
                    setEditingRow(null);
                    setEditedValues(prev => {
                        const newValues = { ...prev };
                        delete newValues[vendor._id];
                        return newValues;
                    });
                });
        } else {
            setEditingRow(vendor._id);
            setEditedValues(prev => ({
                ...prev,
                [vendor._id]: {}
            }));
        }
    };

    const handleDeleteClick = (vendor) => {
        setVendorToDelete(vendor);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            await axios.delete(`${vendors}/${vendorToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVendors();
            setShowDeleteModal(false);
            setVendorToDelete(null);
            toast.success(`Vendor "${vendorToDelete.vendorName}" deleted successfully!`);
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err.response?.data?.error || 'Failed to delete vendor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setShowAddModal(true);
    };

    const handleDownloadImportTemplate = () => {
        const link = document.createElement('a');
        link.href = importVendorTemplate;
        link.download = 'importVendor.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadUpdateTemplate = () => {
        const link = document.createElement('a');
        link.href = updateVendorTemplate;
        link.download = 'updateVendor.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        validateExcelFile(file) && setSelectedImportFile(file);
    };

    const handleUpdateFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        validateExcelFile(file) && setSelectedUpdateFile(file);
    };

    const validateExcelFile = (file) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        const allowedExtensions = /\.(xlsx|xls|csv)$/i;

        if (!allowedTypes.includes(file.type) && !allowedExtensions.test(file.name)) {
            toast.error('Only .xlsx, .xls, .csv files are allowed');
            return false;
        }
        return true;
    };

    const handleImportSubmit = async () => {
        if (!selectedImportFile) {
            toast.error('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedImportFile);

        setIsLoading(true);
        try {
            await axios.post(importVendors, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Vendors imported successfully');
            setShowImportModal(false);
            setSelectedImportFile(null);
            fetchVendors();
        } catch (error) {
            console.error('Error importing vendors:', error);
            toast.error(error.response?.data?.message || 'Error importing vendors');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSubmit = async () => {
        if (!selectedUpdateFile) {
            toast.error('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedUpdateFile);

        setIsLoading(true);
        try {
            await axios.post(updateVendors, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Vendors updated successfully');
            setShowUpdateModal(false);
            setSelectedUpdateFile(null);
            fetchVendors();
        } catch (error) {
            console.error('Error updating vendors:', error);
            toast.error(error.response?.data?.message || 'Error updating vendors');
        } finally {
            setIsLoading(false);
        }
    };

    const validateVendorNo = (x) => /^[0-9]{6}$/.test(x);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!validateVendorNo(newVendor.vendorNo)) {
                toast.error('Vendor Number should be 6 digits');
            }
            else {
                const token = Cookies.get("token");
                await axios.post(vendors, newVendor, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                fetchVendors();
                setShowAddModal(false);
                setNewVendor({
                    vendorName: '',
                    vendorNo: '',
                    PAN: '',
                    GSTNumber: '',
                    complianceStatus: '',
                    PANStatus: '',
                    emailIds: [],
                    phoneNumbers: []
                });
                toast.success(`Vendor "${newVendor.vendorName}" added successfully!`);
            }
        } catch (err) {
            console.error("Add error:", err);
            toast.error(err.response?.data?.error || 'Failed to add vendor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        console.log("Vendor master download clicked");
        // if(selectedRows.length === 0){
        //     setSelectedRows(bills.map(bill => bill.srNo));
        // }
        const titleName = 'Vendor Master';
        const result = await handleExportVendorMaster(vendorData.map(vendorData => vendorData.vendorNo), vendorData, columns, visibleColumnFields, titleName, false);
        console.log("Result = " + result.message);
    }

    const renderCell = (vendor, column) => {
        const isEditing = editingRow === vendor._id;
        const value = vendor[column.field];
        const editedValue = editedValues[vendor._id]?.[column.field];

        if (isEditing) {
            if (column.field === 'complianceStatus') {
                return (
                    <select
                        value={editedValue !== undefined ? editedValue : value}
                        onChange={(e) => handleCellEdit(column.field, e.target.value, vendor._id)}
                        className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none cursor-pointer"
                    >
                        {complianceOptions.map(option => (
                            <option key={option._id} value={option.compliance206AB}>
                                {option.compliance206AB}
                            </option>
                        ))}
                    </select>
                );
            }

            if (column.field === 'PANStatus') {
                return (
                    <select
                        value={editedValue !== undefined ? editedValue : value}
                        onChange={(e) => handleCellEdit(column.field, e.target.value, vendor._id)}
                        className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none cursor-pointer"
                    >
                        {panStatusOptions.map(option => (
                            <option key={option._id} value={option.name}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                );
            }

            if (column.field === 'emailIds' || column.field === 'phoneNumbers') {
                return (
                    <input
                        type="text"
                        value={editedValue !== undefined ? editedValue : (Array.isArray(value) ? value.join(', ') : '')}
                        onChange={(e) => handleCellEdit(column.field, e.target.value.split(',').map(item => item.trim()), vendor._id)}
                        className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none"
                    />
                );
            }

            return (
                <input
                    type="text"
                    value={editedValue !== undefined ? editedValue : (value || '')}
                    onChange={(e) => handleCellEdit(column.field, e.target.value, vendor._id)}
                    className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none"
                />
            );
        }

        return Array.isArray(value) ? value.join(', ') : value;
    };

    const columns = [
        { field: 'vendorNo', headerName: 'Vendor No' },
        { field: 'vendorName', headerName: 'Vendor Name' },
        { field: 'PAN', headerName: 'PAN' },
        { field: 'GSTNumber', headerName: 'GST Number' },
        { field: 'complianceStatus', headerName: '206AB Compliance' },
        { field: 'PANStatus', headerName: 'PAN Status' },
        { field: 'emailIds', headerName: 'Email IDs' },
        { field: 'phoneNumbers', headerName: 'Phone No' },
        { field: 'addl1', headerName: 'Addl1' },
        { field: 'addl2', headerName: 'Addl2' }
    ];

    const visibleColumnFields = ['vendorNo', 'vendorName', 'PAN', 'GSTNumber', 'complianceStatus', 'PANStatus', 'emailIds', 'phoneNumbers', 'addl1', 'addl2']

    return (
        <div className="relative w-full flex flex-col border border-gray-200 rounded-lg">
            {/* Header with Search and Add Button */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Vendor Management</h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none"
                        />
                        <button
                            onClick={handleAddClick}
                            className="bg-[#364cbb] hover:bg-[#364cdd] text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                        >
                            Add Vendor
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="bg-[#4f63d2] hover:bg-[#3d4ebc] text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                        >
                            Import Vendors
                        </button>
                        <button
                            onClick={() => setShowUpdateModal(true)}
                            className="bg-[#14b8a6] hover:bg-[#0d9488] text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                        >
                            Mass Update
                        </button>
                        <button
                            onClick={handleDownload}
                            className="bg-[#f48d02] hover:bg-[#f7a733] text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                        >
                            Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-gray-300">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="divide-x divide-gray-200">
                            <th className="sticky left-0 top-0 z-50 px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50 border-b border-gray-200">
                                <div className="absolute inset-0 bg-gray-50 border-b border-r-2 border-gray-200"></div>
                                <div className="relative z-[51]">Sr No.</div>
                            </th>
                            {columns.map(column => (
                                <th
                                    key={column.field}
                                    className="sticky top-0 z-40 px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50 border-b border-r border-gray-200"
                                >
                                    <div className="absolute inset-0 bg-gray-50 border-b border-r border-gray-200"></div>
                                    <div className="relative z-[41]">{column.headerName}</div>
                                </th>
                            ))}
                            <th className="sticky right-0 top-0 z-50 w-20 px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-gray-50 border-b border-gray-200">
                                <div className="absolute inset-0 bg-gray-50 border-b border-l-2 border-gray-200"></div>
                                <div className="relative z-[51]">Actions</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredData.map((vendor, index) => (
                            <tr key={vendor._id} className="hover:bg-gray-50">
                                <td className="sticky left-0 z-30 px-4 py-3 text-sm text-gray-900 bg-white whitespace-nowrap">
                                    <div className="absolute inset-0 bg-white border-b border-r-2 border-gray-200"></div>
                                    <div className="relative z-[31]">{index + 1}</div>
                                </td>
                                {columns.map(column => (
                                    <td key={column.field} className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-200 whitespace-nowrap">
                                        {renderCell(vendor, column)}
                                    </td>
                                ))}
                                <td className="sticky right-0 z-30 px-4 py-3 text-sm text-gray-900 bg-white">
                                    <div className="absolute inset-0 bg-white border-b border-l-2 border-gray-200"></div>
                                    <div className="relative z-[31] flex justify-center space-x-2">
                                        <button
                                            onClick={() => handleEditClick(vendor)}
                                            className={`${editingRow === vendor._id ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800 cursor-pointer'}`}
                                        >
                                            {editingRow === vendor._id ? (
                                                <CheckIcon className="w-5 h-5 cursor-pointer" />
                                            ) : (
                                                <EditIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                        {!editingRow && (
                                            <button
                                                onClick={() => handleDeleteClick(vendor)}
                                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Add New Vendor</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-gray-800 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="text-sm">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                                        <input
                                            type="text"
                                            value={newVendor.vendorName}
                                            onChange={(e) => setNewVendor({ ...newVendor, vendorName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor No</label>
                                        <input
                                            type="number"
                                            value={newVendor.vendorNo}
                                            onChange={(e) => setNewVendor({ ...newVendor, vendorNo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
                                        <input
                                            type="text"
                                            value={newVendor.PAN}
                                            onChange={(e) => setNewVendor({ ...newVendor, PAN: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                        // required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                        <input
                                            type="text"
                                            value={newVendor.GSTNumber}
                                            onChange={(e) => setNewVendor({ ...newVendor, GSTNumber: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Addl 1</label>
                                        <input
                                            type="text"
                                            value={newVendor.addl1}
                                            onChange={(e) => setNewVendor({ ...newVendor, addl1: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Status and Contact Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Compliance Status</label>
                                        <select
                                            value={newVendor.complianceStatus}
                                            onChange={(e) => setNewVendor({ ...newVendor, complianceStatus: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer bg-white"
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            {complianceOptions.map(option => (
                                                <option key={option._id} value={option.compliance206AB}>
                                                    {option.compliance206AB}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">PAN Status</label>
                                        <select
                                            value={newVendor.PANStatus}
                                            onChange={(e) => setNewVendor({ ...newVendor, PANStatus: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer bg-white"
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            {panStatusOptions.map(option => (
                                                <option key={option._id} value={option.name}>
                                                    {option.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email IDs (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={newVendor.emailIds.join(', ')}
                                            onChange={(e) => setNewVendor({ ...newVendor, emailIds: e.target.value.split(',').map(item => item.trim()) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                            placeholder="email1@example.com, email2@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={newVendor.phoneNumbers.join(', ')}
                                            onChange={(e) => setNewVendor({ ...newVendor, phoneNumbers: e.target.value.split(',').map(item => item.trim()) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                            placeholder="1234567890, 0987654321"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Addl 2</label>
                                        <input
                                            type="text"
                                            value={newVendor.addl2}
                                            onChange={(e) => setNewVendor({ ...newVendor, addl2: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#364cbb] hover:bg-[#364cdd] text-white rounded-md cursor-pointer"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Adding...' : 'Add Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>

                            <h3 className="text-xl font-bold mb-2">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete vendor "{vendorToDelete?.vendorName}"? This action cannot be undone.
                            </p>

                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded cursor-pointer"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Vendor'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showImportModal && (
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Import Vendors</h2>
                            <button 
                                onClick={() => {
                                    setShowImportModal(false);
                                    setSelectedImportFile(null);
                                }}
                                className="text-gray-600 hover:text-gray-800 hover:cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Download the template and fill in your vendor details:</p>
                                <button
                                    onClick={handleDownloadImportTemplate}
                                    className="text-blue-600 hover:text-blue-800 text-sm underline hover:cursor-pointer"
                                >
                                    Download Template
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleImportFileSelect}
                                    className="w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowImportModal(false);
                                        setSelectedImportFile(null);
                                    }}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md hover:cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImportSubmit}
                                    disabled={!selectedImportFile || isLoading}
                                    className={`px-4 py-2 rounded-md text-white ${
                                        !selectedImportFile 
                                            ? 'bg-blue-300 cursor-not-allowed' 
                                            : 'bg-blue-600 hover:bg-blue-700 hover:cursor-pointer'
                                    }`}
                                >
                                    {isLoading ? 'Importing...' : 'Import'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Mass Update Vendors</h2>
                            <button 
                                onClick={() => {
                                    setShowUpdateModal(false);
                                    setSelectedUpdateFile(null);
                                }}
                                className="text-gray-600 hover:text-gray-800 hover:cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-2">Download the template and fill in the vendor details to update:</p>
                                <button
                                    onClick={handleDownloadUpdateTemplate}
                                    className="text-blue-600 hover:text-blue-800 text-sm underline hover:cursor-pointer"
                                >
                                    Download Template
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleUpdateFileSelect}
                                    className="w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowUpdateModal(false);
                                        setSelectedUpdateFile(null);
                                    }}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md hover:cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateSubmit}
                                    disabled={!selectedUpdateFile || isLoading}
                                    className={`px-4 py-2 rounded-md text-white ${
                                        !selectedUpdateFile 
                                            ? 'bg-teal-300 cursor-not-allowed' 
                                            : 'bg-teal-600 hover:bg-teal-700 hover:cursor-pointer'
                                    }`}
                                >
                                    {isLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorTable;
