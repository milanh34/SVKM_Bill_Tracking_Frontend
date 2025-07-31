import React, { useState, useEffect } from 'react';
import { EditIcon, CheckIcon } from '../Icons';
import axios from 'axios';
import { currencies } from '../../apis/master.api';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const CurrencyTable = () => {
    const [currencyData, setCurrencyData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingRow, setEditingRow] = useState(null);
    const [editedValues, setEditedValues] = useState({});

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currencyToDelete, setCurrencyToDelete] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCurrency, setNewCurrency] = useState({
        currency: ''
    });

    // Fetch currencies on component mount
    useEffect(() => {
        fetchCurrencies();
    }, []);
    
    const fetchCurrencies = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await axios.get(currencies, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrencyData(response.data);
            setFilteredData(response.data);
        } catch (error) {
            console.error("Error fetching currencies:", error);
            toast.error('Failed to fetch currencies');
        } finally {
            setIsLoading(false);
        }
    };

    // Search functionality
    useEffect(() => {
        const filtered = !searchTerm 
            ? currencyData 
            : currencyData.filter(currency =>
                Object.values(currency).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
            );
        setFilteredData(filtered);
    }, [searchTerm, currencyData]);

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
            await axios.post(currencies, newCurrency, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchCurrencies();
            setShowAddModal(false);
            setNewCurrency({ currency: '' });
            toast.success(`Currency "${newCurrency.currency.toUpperCase()}" added successfully!`);
        } catch (err) {
            console.error("Add error:", err);
            toast.error(err.response?.data?.error || 'Failed to add currency');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (currency) => {
        if (editingRow === currency._id) {
            const editedFieldsForRow = editedValues[currency._id];
            if (!editedFieldsForRow) {
                setEditingRow(null);
                return;
            }

            const token = Cookies.get("token");
            axios.put(`${currencies}/${currency._id}`, editedFieldsForRow, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(() => {
                fetchCurrencies();
                toast.success('Currency updated successfully!');
            })
            .catch(error => {
                console.error("Edit error:", error);
                toast.error(error.response?.data?.error || 'Failed to update currency');
            })
            .finally(() => {
                setEditingRow(null);
                setEditedValues(prev => {
                    const newValues = { ...prev };
                    delete newValues[currency._id];
                    return newValues;
                });
            });
        } else {
            setEditingRow(currency._id);
            setEditedValues(prev => ({
                ...prev,
                [currency._id]: {}
            }));
        }
    };

    const handleDeleteConfirm = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            await axios.delete(`${currencies}/${currencyToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCurrencies();
            setShowDeleteModal(false);
            setCurrencyToDelete(null);
            toast.success(`Currency "${currencyToDelete.currency}" deleted successfully!`);
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err.response?.data?.error || 'Failed to delete currency');
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

    const renderCell = (currency, column) => {
        const isEditing = editingRow === currency._id;
        const value = currency[column.field];
        const editedValue = editedValues[currency._id]?.[column.field];

        if (isEditing) {
            return (
                <input
                    type="text"
                    value={editedValue !== undefined ? editedValue : (value || '')}
                    onChange={(e) => handleCellEdit(column.field, e.target.value, currency._id)}
                    className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none"
                />
            );
        }

        return value || '-';
    };

    const columns = [
        { field: 'currency', headerName: 'Currency' }
    ];

    const AddModalContent = () => (
        <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <input
                    type="text"
                    value={newCurrency.currency}
                    onChange={(e) => setNewCurrency({
                        currency: e.target.value
                    })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    autoFocus
                />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
                    {isLoading ? 'Adding...' : 'Add Currency'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="relative w-full flex flex-col border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">Currency Management</h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search currencies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none"
                        />
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#364cbb] hover:bg-[#364cdd] text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                        >
                            Add Currency
                        </button>
                    </div>
                </div>
            </div>

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
                        {filteredData.map((currency, index) => (
                            <tr key={currency._id} className="hover:bg-gray-50">
                                <td className="sticky left-0 z-30 px-4 py-3 text-sm text-gray-900 bg-white whitespace-nowrap">
                                    <div className="absolute inset-0 bg-white border-b border-r-2 border-gray-200"></div>
                                    <div className="relative z-[31]">{index + 1}</div>
                                </td>
                                {columns.map(column => (
                                    <td key={column.field} className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-200 whitespace-nowrap">
                                        {renderCell(currency, column)}
                                    </td>
                                ))}
                                <td className="sticky right-0 z-30 px-4 py-3 text-sm text-gray-900 bg-white">
                                    <div className="absolute inset-0 bg-white border-b border-l-2 border-gray-200"></div>
                                    <div className="relative z-[31] flex justify-center space-x-2">
                                        <button
                                            onClick={() => handleEditClick(currency)}
                                            className={`${editingRow === currency._id ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800 cursor-pointer'}`}
                                        >
                                            {editingRow === currency._id ? (
                                                <CheckIcon className="w-5 h-5 cursor-pointer" />
                                            ) : (
                                                <EditIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                        {!editingRow && (
                                            <button
                                                onClick={() => {
                                                    setCurrencyToDelete(currency);
                                                    setShowDeleteModal(true);
                                                }}
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

            {showAddModal && (
                <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-[10px] flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Add New Currency</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-gray-800 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <AddModalContent />
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-[10px] flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="text-center">
                            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>

                            <h3 className="text-xl font-bold mb-2">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete currency "{currencyToDelete?.currency}"? This action cannot be undone.
                            </p>

                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md cursor-pointer"
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

export default CurrencyTable;
