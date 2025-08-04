import React, { useState, useEffect } from 'react';
import { EditIcon, CheckIcon } from '../Icons';
import axios from 'axios';
import { users, regions } from '../../apis/master.api';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const UserTable = () => {
    const [userData, setUserData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingRow, setEditingRow] = useState(null);
    const [editedValues, setEditedValues] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [regionOptions, setRegionOptions] = useState([]);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: [],
        // department: [],
        region: [],
        password: 'password123'
    });

    // const departmentOptions = [
    //     "Site",
    //     "PIMO",
    //     "QS",
    //     "IT",
    //     "Accounts",
    //     "Management",
    //     "Admin"
    // ];

    const roleDisplayMap = {
        'admin': 'Admin',
        'site_officer': 'Site Team',
        'site_pimo': 'PIMO Mumbai Team',
        'qs_site': 'QS Team',
        // 'pimo_mumbai': 'Advance & Direct FI Entry',
        'director': 'Trustee, Advisor & Director',
        'accounts': 'Accounts'
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            const headers = { Authorization: `Bearer ${token}` };
            
            let usersResponse = { data: { data: [] } };
            let regionsResponse = { data: [] };
            
            try {
                [usersResponse, regionsResponse] = await Promise.all([
                    axios.get(users, { headers }),
                    axios.get(regions, { headers })
                ]);
            } catch (error) {
                console.error("Error in Promise.all:", error);
            }

            console.log("Users Response:", usersResponse);
            console.log("Regions Response:", regionsResponse);
            setUserData(usersResponse?.data || []);
            setFilteredData(usersResponse?.data || []);
            setRegionOptions(regionsResponse?.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
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
            // user.department.toLowerCase().includes(query) ||
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
                axios.put(`${users}/${user._id}`, payload)
                    .then(response => {
                        fetchData();
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
            const token = Cookies.get("token");
            await axios.delete(`${users}/${userToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchData();
            setShowDeleteConfirm(false);
            setUserToDelete(null);
            toast.success(`User "${userToDelete?.name}" deleted successfully!`);
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error('Failed to delete user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            await axios.post(users, newUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchData();
            setShowAddModal(false);
            toast.success(`User "${newUser.name}" added successfully!`);
            setNewUser({
                name: '',
                email: '',
                role: [],
                // department: [],
                region: [],
                password: 'password123'
            });
        } catch (err) {
            console.error("Add error:", err);
            toast.error(err.response?.data?.error || 'Failed to add user');
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

        if (column.field === 'lastLogin') {
            return formatDate(value);
        }

        if (isEditing) {
            if (column.field === 'role') {
                const currentRoles = editedValue !== undefined ? editedValue : (Array.isArray(value) ? value : [value]);
                return (
                    <div className="flex flex-wrap gap-2">
                        {currentRoles.map((role, idx) => (
                            <div key={idx} className="flex items-center bg-blue-100 rounded px-2 py-1">
                                <span>{roleDisplayMap[role] || role}</span>
                                {currentRoles.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const newRoles = currentRoles.filter((_, i) => i !== idx);
                                            handleCellEdit(column.field, newRoles, user._id);
                                        }}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    const newRoles = [...currentRoles, e.target.value];
                                    handleCellEdit(column.field, newRoles, user._id);
                                    e.target.value = '';
                                }
                            }}
                            className="px-2 py-1 bg-blue-50 border border-blue-200 rounded"
                        >
                            <option value="">Add role...</option>
                            {Object.entries(roleDisplayMap)
                                .filter(([role]) => !currentRoles.includes(role))
                                .map(([roleValue, roleDisplay]) => (
                                    <option key={roleValue} value={roleValue}>
                                        {roleDisplay}
                                    </option>
                                ))}
                        </select>
                    </div>
                );
            }

            if (column.field === 'region') {
                const currentRegions = editedValue !== undefined ? editedValue : (Array.isArray(value) ? value : [value]);
                return (
                    <div className="flex flex-wrap gap-2">
                        {currentRegions.map((region, idx) => (
                            <div key={idx} className="flex items-center bg-blue-100 rounded px-2 py-1">
                                <span>{region}</span>
                                {currentRegions.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const newRegions = currentRegions.filter((_, i) => i !== idx);
                                            handleCellEdit(column.field, newRegions, user._id);
                                        }}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    const newRegions = [...currentRegions, e.target.value];
                                    handleCellEdit(column.field, newRegions, user._id);
                                    e.target.value = '';
                                }
                            }}
                            className="px-2 py-1 bg-blue-50 border border-blue-200 rounded"
                        >
                            <option value="">Add region...</option>
                            {regionOptions
                                .filter(option => !currentRegions.includes(option.name))
                                .map(option => (
                                    <option key={option._id} value={option.name}>
                                        {option.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                );
            }

            // if (column.field === 'department') {
            //     const currentDepartments = editedValue !== undefined ? editedValue : (Array.isArray(value) ? value : [value]);
            //     return (
            //         <div className="flex flex-wrap gap-2">
            //             {currentDepartments.map((dept, idx) => (
            //                 <div key={idx} className="flex items-center bg-blue-100 rounded px-2 py-1">
            //                     <span>{dept}</span>
            //                     {currentDepartments.length > 1 && (
            //                         <button
            //                             onClick={() => {
            //                                 const newDepts = currentDepartments.filter((_, i) => i !== idx);
            //                                 handleCellEdit(column.field, newDepts, user._id);
            //                             }}
            //                             className="ml-1 text-red-500 hover:text-red-700"
            //                         >
            //                             ×
            //                         </button>
            //                     )}
            //                 </div>
            //             ))}
            //             <select
            //                 onChange={(e) => {
            //                     if (e.target.value) {
            //                         const newDepts = [...currentDepartments, e.target.value];
            //                         handleCellEdit(column.field, newDepts, user._id);
            //                         e.target.value = '';
            //                     }
            //                 }}
            //                 className="px-2 py-1 bg-blue-50 border border-blue-200 rounded"
            //             >
            //                 <option value="">Add department...</option>
            //                 {departmentOptions
            //                     .filter(dept => !currentDepartments.includes(dept))
            //                     .map(dept => (
            //                         <option key={dept} value={dept}>
            //                             {dept}
            //                         </option>
            //                     ))}
            //             </select>
            //         </div>
            //     );
            // }

            return (
                <input
                    type="text"
                    value={editedValue !== undefined ? editedValue : (value || '')}
                    onChange={(e) => handleCellEdit(column.field, e.target.value, user._id)}
                    className="w-full px-2 py-1 bg-blue-50 border border-blue-200 rounded focus:outline-none"
                />
            );
        }

        if (column.field === "role") {
            const roles = Array.isArray(value) ? value : [value];
            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map((role, idx) =>
                        role !== "pimo_mumbai" && (
                            <span
                                key={idx}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                            >
                                {roleDisplayMap[role] || role}
                            </span>
                        )
                    )}
                </div>
            );
        }

        if (column.field === 'region') {
            const regions = Array.isArray(value) ? value : [value];
            return (
                <div className="flex flex-wrap gap-1">
                    {regions.map((region, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {region}
                        </span>
                    ))}
                </div>
            );
        }

        // if (column.field === 'department') {
        //     const departments = Array.isArray(value) ? value : [value];
        //     return (
        //         <div className="flex flex-wrap gap-1">
        //             {departments.map((dept, idx) => (
        //                 <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
        //                     {dept}
        //                 </span>
        //             ))}
        //         </div>
        //     );
        // }

        return value;
    };

    const columns = [
        { field: 'name', headerName: 'Name' },
        { field: 'email', headerName: 'Email' },
        { field: 'role', headerName: 'Role' },
        // { field: 'department', headerName: 'Department' },
        { field: 'region', headerName: 'Region' },
        { field: 'lastLogin', headerName: 'Last Login' }
    ];

    return (
        <div className="relative w-full flex flex-col border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">User Management</h1>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none"
                        />
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#364cbb] hover:bg-[#364cdd] text-white px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
                        >
                            Add User
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
                                            className={`${editingRow === user._id ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'} cursor-pointer`}
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
                    <div className="bg-white rounded-lg p-4 w-full max-w-4xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Add New User</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-gray-800 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input
                                            type="text"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {newUser.role.map((role, idx) => (
                                                <div key={idx} className="flex items-center bg-blue-100 rounded px-2 py-1">
                                                    <span>{roleDisplayMap[role] || role}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewUser({
                                                            ...newUser,
                                                            role: newUser.role.filter((_, i) => i !== idx)
                                                        })}
                                                        className="ml-1 text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <select
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    setNewUser({
                                                        ...newUser,
                                                        role: [...newUser.role, e.target.value]
                                                    });
                                                    e.target.value = '';
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer bg-white"
                                        >
                                            <option value="">Add Role...</option>
                                            {Object.entries(roleDisplayMap)
                                                .filter(([role]) => !newUser.role.includes(role))
                                                .map(([roleValue, roleDisplay]) => (
                                                    <option key={roleValue} value={roleValue}>
                                                        {roleDisplay}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Departments</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {newUser.department.map((dept, idx) => (
                                                <div key={idx} className="flex items-center bg-blue-100 rounded px-2 py-1">
                                                    <span>{dept}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewUser({
                                                            ...newUser,
                                                            department: newUser.department.filter((_, i) => i !== idx)
                                                        })}
                                                        className="ml-1 text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <select
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    setNewUser({
                                                        ...newUser,
                                                        department: [...newUser.department, e.target.value]
                                                    });
                                                    e.target.value = '';
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer bg-white"
                                        >
                                            <option value="">Add Department...</option>
                                            {departmentOptions
                                                .filter(dept => !newUser.department.includes(dept))
                                                .map(dept => (
                                                    <option key={dept} value={dept}>
                                                        {dept}
                                                    </option>
                                                ))}
                                        </select>
                                    </div> */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Regions</label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {newUser.region.map((region, idx) => (
                                                <div key={idx} className="flex items-center bg-blue-100 rounded px-2 py-1">
                                                    <span>{region}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewUser({
                                                            ...newUser,
                                                            region: newUser.region.filter((_, i) => i !== idx)
                                                        })}
                                                        className="ml-1 text-red-500 hover:text-red-700"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <select
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    setNewUser({
                                                        ...newUser,
                                                        region: [...newUser.region, e.target.value]
                                                    });
                                                    e.target.value = '';
                                                }
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none cursor-pointer bg-white"
                                        >
                                            <option value="">Add Region...</option>
                                            {regionOptions
                                                .filter(option => !newUser.region.includes(option.name))
                                                .map(option => (
                                                    <option key={option._id} value={option.name}>
                                                        {option.name}
                                                    </option>
                                                ))}
                                        </select>
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
                                    {isLoading ? 'Adding...' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-300/50 backdrop-blur-[10px] flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="text-center">
                            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                            <p className="mb-6">
                                Are you sure you want to delete user: <span className="font-bold">{userToDelete?.name}</span>?
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
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

export default UserTable;
