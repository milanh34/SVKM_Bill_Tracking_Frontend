import React, { useState, useEffect } from 'react'
import Header from '../components/Header';
import pen from "../assets/pen.svg";
import bin from "../assets/bin.svg";
import { authUsers } from '../apis/user.apis';
import axios from 'axios';

const UserTable = () => {
    // Sample user data 
    // const sampleUserData = [];

    // State management
    const [userData, setUserData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Pagination settings
    const usersPerPage = 15;
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = userData.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(userData.length / usersPerPage);

    // Function to format date to a readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle edit click
    const handleEditClick = (user) => {
        setEditUser({ ...user });
        setIsEditing(true);
    };

    // Handle delete click
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    // Handle input change during edit
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditUser({
            ...editUser,
            [name]: value
        });
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(authUsers);
                console.log(response.data);

                setUserData(response.data.data);

            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchUserData();
    }, [])

    // Handle form submission for edit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await fetch(`${authUsers}/${editUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editUser)
            });

            // For demo, we'll just update the local state
            const updatedUsers = userData.map(user =>
                user._id === editUser._id ? editUser : user
            );

            setUserData(updatedUsers);
            setIsEditing(false);
            setEditUser(null);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log("User updated successfully:", editUser);
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle user deletion
    const handleDeleteConfirm = async () => {
        setIsLoading(true);

        try {
            await fetch(`${authUsers}/${userToDelete._id}`, {
                method: 'DELETE'
            });

            // For demo, we'll just update the local state
            const filteredUsers = userData.filter(user => user._id !== userToDelete._id);
            setUserData(filteredUsers);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log("User deleted successfully:", userToDelete);

            // Close the confirmation dialog
            setShowDeleteConfirm(false);
            setUserToDelete(null);

            // If we deleted the last user on the current page, go to previous page
            if (currentUsers.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Header />

            <div className="px-10 py-6">
                <h1 className="text-xl font-bold text-blue-800 mb-6">List Of Users</h1>

                {/* User Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-black-400">
                        <thead>
                            <tr className="bg-gray-200">
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
                            {currentUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border">{user.name}</td>
                                        <td className="py-2 px-4 border">{user.email}</td>
                                        <td className="py-2 px-4 border">
                                            <span className="capitalize">{user.role.replace('_', ' ')}</span>
                                        </td>
                                        <td className="py-2 px-4 border">{user.department}</td>
                                        <td className="py-2 px-4 border">{user.region}</td>
                                        <td className="py-2 px-4 border">{formatDate(user.lastLogin)}</td>
                                        <td className="py-2 px-4 border">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm"
                                                >
                                                    <img src={pen} alt="edit" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(user)}
                                                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm"
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

                {/* Pagination */}
                {userData.length > 0 && (
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-600">
                            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, userData.length)} of {userData.length} users
                        </div>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    onClick={() => handlePageChange(number)}
                                    className={`px-3 py-1 rounded ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    {number}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-transparent backdrop-blur-[10px] bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-[60%]">
                            <h2 className="text-xl font-bold mb-4">Edit User</h2>
                            <form onSubmit={handleEditSubmit}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div className="mb-4 w-[50%]">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editUser.name}
                                            onChange={handleInputChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4 w-[50%]">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editUser.email}
                                            onChange={handleInputChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
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
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
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
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
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
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
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
                    <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-[10px] flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                            <p className="mb-6">Are you sure you want to delete user: <span className="font-bold">{userToDelete?.name}</span>?</p>
                            <div className="flex justify-end space-x-2">
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
        </div>
    )
}

export default UserTable