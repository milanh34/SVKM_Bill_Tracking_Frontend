import React, { useState, useEffect } from 'react';
import { EditIcon, CheckIcon } from '../dashboard/Icons';
import axios from 'axios';
import { compliances } from '../../apis/master.api';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const ComplianceTable = () => {
    const [complianceData, setComplianceData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRow, setEditingRow] = useState(null);
    const [editedValues, setEditedValues] = useState({});

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [complianceToDelete, setComplianceToDelete] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCompliance, setNewCompliance] = useState({
        compliance206AB: ''
    });

    // Fetch compliances on component mount
    useEffect(() => {
        fetchCompliances();
    }, []);

    const fetchCompliances = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await axios.get(compliances, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Compliance data:", response.data);
            setComplianceData(response.data);
            setFilteredData(response.data);
        } catch (error) {
            console.error("Error fetching compliances:", error);
            toast.error('Failed to fetch compliances');
        } finally {
            setIsLoading(false);
        }
    };

    // Search functionality
    useEffect(() => {
        if (!searchTerm) {
            setFilteredData(complianceData);
            return;
        }

        const filtered = complianceData.filter(compliance =>
            Object.values(compliance)
                .join(' ')
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
        setFilteredData(filtered);
    }, [searchTerm, complianceData]);

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

    // CRUD Operations
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await axios.post(compliances, newCompliance, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setComplianceData([...complianceData, response.data]);
            setFilteredData([...complianceData, response.data]);
            setShowAddModal(false);
            setNewCompliance({ compliance206AB: '' });
            toast.success('Compliance added successfully!');
        } catch (err) {
            console.error("Add error:", err);
            toast.error('Failed to add compliance');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (compliance) => {
        if (editingRow === compliance._id) {
            const editedFieldsForRow = editedValues[compliance._id];
            if (!editedFieldsForRow) {
                setEditingRow(null);
                return;
            }

            const payload = { ...editedFieldsForRow };
            delete payload._id;

            if (Object.keys(payload).length > 0) {
                const token = Cookies.get("token");
                axios.put(`${compliances}/${compliance._id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    const updated = complianceData.map(c =>
                        c._id === compliance._id ? { ...c, ...response.data } : c
                    );
                    setComplianceData(updated);
                    setFilteredData(updated);
                    toast.success('Compliance updated successfully!');
                })
                .catch(error => {
                    console.error("Edit error:", error);
                    toast.error('Failed to update compliance');
                })
                .finally(() => {
                    setEditingRow(null);
                    setEditedValues(prev => {
                        const newValues = { ...prev };
                        delete newValues[compliance._id];
                        return newValues;
                    });
                });
            }
        } else {
            setEditingRow(compliance._id);
            setEditedValues(prev => ({
                ...prev,
                [compliance._id]: {}
            }));
        }
    };

    const handleDeleteConfirm = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            await axios.delete(`${compliances}/${complianceToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const filtered = complianceData.filter(c => c._id !== complianceToDelete._id);
            setComplianceData(filtered);
            setFilteredData(filtered);
            setShowDeleteModal(false);
            setComplianceToDelete(null);
            toast.success('Compliance deleted successfully!');
        } catch (err) {
            console.error("Delete error:", err);
            toast.error('Failed to delete compliance');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCellEdit = (field, value, rowId) => {
        setEditedValues(prev => ({
            ...prev,
            [rowId]: {
                ...prev[rowId],
                [field]: value
            }
        }));
    };

    const columns = [
        { field: 'compliance206AB', headerName: 'Compliance 206AB' }
    ];

    const renderCell = (compliance, column) => {
        const isEditing = editingRow === compliance._id;
        const value = compliance[column.field];
        const editedValue = editedValues[compliance._id]?.[column.field];

        if (isEditing) {
            return (
                <input
                    type="text"
                    value={editedValue !== undefined ? editedValue : (value || '')}
                    onChange={(e) => handleCellEdit(column.field, e.target.value, compliance._id)}
                    className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            );
        }

        return value || '-';
    };

    const AddModalContent = () => (
        <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Compliance 206AB</label>
                <input
                    type="text"
                    value={newCompliance.compliance206AB}
                    onChange={(e) => setNewCompliance({ ...newCompliance, compliance206AB: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    disabled={isLoading}
                >
                    {isLoading ? 'Adding...' : 'Add Compliance'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="relative w-full flex flex-col border border-gray-200 rounded-lg">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Compliance Management</h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search compliances..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                        >
                            Add Compliance
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
                        {filteredData.map((compliance, index) => (
                            <tr key={compliance._id} className="hover:bg-gray-50">
                                <td className="sticky left-0 z-30 px-4 py-3 text-sm text-gray-900 bg-white whitespace-nowrap">
                                    <div className="absolute inset-0 bg-white border-b border-r-2 border-gray-200"></div>
                                    <div className="relative z-[31]">{index + 1}</div>
                                </td>
                                {columns.map(column => (
                                    <td key={column.field} className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-200 whitespace-nowrap">
                                        {renderCell(compliance, column)}
                                    </td>
                                ))}
                                <td className="sticky right-0 z-30 px-4 py-3 text-sm text-gray-900 bg-white">
                                    <div className="absolute inset-0 bg-white border-b border-l-2 border-gray-200"></div>
                                    <div className="relative z-[31] flex justify-center space-x-2">
                                        <button
                                            onClick={() => handleEditClick(compliance)}
                                            className={`${editingRow === compliance._id ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'}`}
                                        >
                                            {editingRow === compliance._id ? (
                                                <CheckIcon className="w-5 h-5" />
                                            ) : (
                                                <EditIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                        {!editingRow && (
                                            <button
                                                onClick={() => {
                                                    setComplianceToDelete(compliance);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="text-red-600 hover:text-red-800"
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
                <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-[10px] bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Add New Compliance</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-gray-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <AddModalContent />
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-[10px] lex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>

                            <h3 className="text-xl font-bold mb-2">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete compliance "{complianceToDelete?.compliance206AB}"? This action cannot be undone.
                            </p>

                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplianceTable;
