import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import pen from "../assets/pen.svg";
import bin from "../assets/bin.svg";
import { authUsers } from '../apis/user.apis';
import axios from 'axios';

const UserTable = () => {
    const [userData, setUserData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

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

    const handleEditClick = (user) => {
        setEditUser({ ...user });
        setIsEditing(true);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditUser(prev => ({ ...prev, [name]: value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await fetch(`${authUsers}/${editUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editUser)
            });

            const updatedUsers = userData.map(user =>
                user._id === editUser._id ? editUser : user
            );
            setUserData(updatedUsers);
            setFilteredData(updatedUsers);
            setIsEditing(false);
            setEditUser(null);
            console.log("User updated successfully:", editUser);
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setIsLoading(false);
        }
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

    return (
        <div className="px-10 py-6">

            {/* Search Bar */}
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-blue-800 mb-6">List Of Users</h1>
                <input
                    type="text"
                    placeholder="Search by name, email, role, department, region..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-[80%] p-2 border border-gray-400 rounded"
                />
            </div>

            {/* User Table */}
            <div className="overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto border border-gray-300 rounded">
                    <table className="min-w-full bg-white">
                        <thead className="sticky top-0 bg-gray-200 z-10">
                            <tr>
                                <th className="py-2 px-4 border text-left">Name</th>
                                <th className="py-2 px-4 border text-left">Email</th>
                                <th className="py-2 px-4 border text-left">Role</th>
                                <th className="py-2 px-4 border text-left">Department</th>
                                <th className="py-2 px-4 border text-left">Region</th>
                                <th className="py-2 px-4 border text-left">Last Login</th>
                                <th className="py-2 px-4 border text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border">{user.name}</td>
                                        <td className="py-2 px-4 border">{user.email}</td>
                                        <td className="py-2 px-4 border capitalize">{user.role.replace('_', ' ')}</td>
                                        <td className="py-2 px-4 border">{user.department}</td>
                                        <td className="py-2 px-4 border">{user.region}</td>
                                        <td className="py-2 px-4 border">{formatDate(user.lastLogin)}</td>
                                        <td className="py-2 px-4 border">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm cursor-pointer"
                                                >
                                                    <img src={pen} alt="edit" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm cursor-pointer"
                                                >
                                                    <img src={bin} alt="delete" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-[10px] bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[60%]">
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="flex gap-4">
                                <div className="w-1/2 mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editUser.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="w-1/2 mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editUser.email}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                                <select
                                    name="role"
                                    value={editUser.role}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="site_officer">Site Officer</option>
                                    <option value="project_manager">Project Manager</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={editUser.department}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Region</label>
                                <input
                                    type="text"
                                    name="region"
                                    value={editUser.region}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
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
