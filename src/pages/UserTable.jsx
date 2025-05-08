import React, { useState, useEffect } from 'react';
import { EditIcon, CheckIcon } from '../components/dashboard/Icons';
import { authUsers } from '../apis/user.apis';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserTable = () => {
    const [userData, setUserData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingRow, setEditingRow] = useState(null);
    const [editedValues, setEditedValues] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(authUsers);
                setUserData(response.data.data);
                setFilteredData(response.data.data);
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);

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

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = userData.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query) ||
            user.department.toLowerCase().includes(query) ||
            user.region.toLowerCase().includes(query)
        );
        setFilteredData(filtered);
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

    const handleEditClick = (user) => {
        if (editingRow === user._id) {
            const editedFieldsForRow = editedValues[user._id];
            if (!editedFieldsForRow) {
                setEditingRow(null);
                return;
            }

            const payload = { ...editedFieldsForRow };
            delete payload._id;

            if (Object.keys(payload).length > 0) {
                axios.put(`${authUsers}/${user._id}`, payload)
                    .then(response => {
                        const updated = userData.map(u =>
                            u._id === user._id ? { ...u, ...response.data } : u
                        );
                        setUserData(updated);
                        setFilteredData(updated);
                        toast.success('User updated successfully!');
                    })
                    .catch(error => {
                        console.error("Edit error:", error);
                        toast.error('Failed to update user');
                    })
                    .finally(() => {
                        setEditingRow(null);
                        setEditedValues(prev => {
                            const newValues = { ...prev };
                            delete newValues[user._id];
                            return newValues;
                        });
                    });
            } else {
                setEditingRow(null);
                setEditedValues(prev => {
                    const newValues = { ...prev };
                    delete newValues[user._id];
                    return newValues;
                });
            }
        } else {
            setEditingRow(user._id);
            setEditedValues(prev => ({
                ...prev,
                [user._id]: {}
            }));
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        setIsLoading(true);
        try {
            await fetch(`${authUsers}/${userToDelete._id}`, {
                method: 'DELETE'
            });

            const updatedUsers = userData.filter(user => user._id !== userToDelete._id);
            setUserData(updatedUsers);
            setFilteredData(updatedUsers);
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            console.log("User deleted successfully:", userToDelete);
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const renderCell = (user, column) => {
        const isEditing = editingRow === user._id;
        const value = user[column.field];
        const editedValue = editedValues[user._id]?.[column.field];

        if (isEditing) {
            if (column.field === 'role') {
                return (
                    <select
                        value={editedValue !== undefined ? editedValue : value}
                        onChange={(e) => handleCellEdit(column.field, e.target.value, user._id)}
                        className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="admin">Admin</option>
                        <option value="site_officer">Site Team</option>
                        <option value="project_manager">Project Manager</option>
                    </select>
                );
            }

            return (
                <input
                    type="text"
                    value={editedValue !== undefined ? editedValue : (value || '')}
                    onChange={(e) => handleCellEdit(column.field, e.target.value, user._id)}
                    className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            );
        }

        if (column.field === 'lastLogin') return formatDate(value);
        if (column.field === 'role') return value.replace('_', ' ').toLowerCase();
        return value;
    };

    const columns = [
        { field: 'name', headerName: 'Name' },
        { field: 'email', headerName: 'Email' },
        { field: 'role', headerName: 'Role' },
        { field: 'department', headerName: 'Department' },
        { field: 'region', headerName: 'Region' },
        { field: 'lastLogin', headerName: 'Last Login' }
    ];

    return (
        <div className="relative w-full flex flex-col border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">User Management</h1>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                        {filteredData.map((user, index) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="sticky left-0 z-30 px-4 py-3 text-sm text-gray-900 bg-white whitespace-nowrap">
                                    <div className="absolute inset-0 bg-white border-b border-r-2 border-gray-200"></div>
                                    <div className="relative z-[31]">{index + 1}</div>
                                </td>
                                {columns.map(column => (
                                    <td key={column.field} className="px-4 py-3 text-sm text-gray-900 border-b border-r border-gray-200 whitespace-nowrap">
                                        {renderCell(user, column)}
                                    </td>
                                ))}
                                <td className="sticky right-0 z-30 px-4 py-3 text-sm text-gray-900 bg-white">
                                    <div className="absolute inset-0 bg-white border-b border-l-2 border-gray-200"></div>
                                    <div className="relative z-[31] flex justify-center space-x-2">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className={`${editingRow === user._id ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'}`}
                                        >
                                            {editingRow === user._id ? (
                                                <CheckIcon className="w-5 h-5" />
                                            ) : (
                                                <EditIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                        {!editingRow && (
                                            <button
                                                onClick={() => handleDeleteClick(user)}
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

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-[10px] bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p className="mb-6">
                            Are you sure you want to delete user: <span className="font-bold">{userToDelete?.name}</span>?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTable;
