import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import pen from "../assets/pen.svg";
import bin from "../assets/bin.svg";
import axios from 'axios';
import { vendors } from '../apis/vendor.api';
import Cookies from "js-cookie";

const VendorTable = () => {
    const [vendorData, setVendorData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [vendorsPerPage] = useState(10);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editVendor, setEditVendor] = useState(null);
    const [vendorToDelete, setVendorToDelete] = useState(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await axios.get(vendors, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setVendorData(response.data);
        } catch (error) {
            console.error("Error fetching vendors:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Pagination logic
    const indexOfLastVendor = currentPage * vendorsPerPage;
    const indexOfFirstVendor = indexOfLastVendor - vendorsPerPage;
    const currentVendors = vendorData.slice(indexOfFirstVendor, indexOfLastVendor);
    const totalPages = Math.ceil(vendorData.length / vendorsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Modal handlers
    const handleEditClick = (vendor) => {
        setEditVendor({ ...vendor });
        setShowEditModal(true);
    };

    const handleDeleteClick = (vendor) => {
        setVendorToDelete(vendor);
        setShowDeleteModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditVendor({ ...editVendor, [name]: value });
    };

    const handleArrayInputChange = (e, field) => {
        const { value } = e.target;
        const arrayValues = value.split(',').map(item => item.trim());
        setEditVendor({ ...editVendor, [field]: arrayValues });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            const response = await fetch(`${vendors}/${editVendor._id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include', // Similar to withCredentials in axios
                body: JSON.stringify(editVendor)
            });

            console.log(response);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const updated = vendorData.map(v =>
                v._id === editVendor._id ? editVendor : v
            );
            setVendorData(updated);
            setShowEditModal(false);
            setEditVendor(null);
        } catch (err) {
            console.error("Edit error:", err);
            // Add user feedback for error
            alert("Failed to update vendor. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setIsLoading(true);
        try {
            const token = Cookies.get("token");
            await axios.delete(`${vendors}/${vendorToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const filtered = vendorData.filter(v => v._id !== vendorToDelete._id);
            setVendorData(filtered);
            setShowDeleteModal(false);
            setVendorToDelete(null);
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="px-10 py-6">
                <h1 className="text-xl font-bold text-blue-800 mb-6">List Of Vendors</h1>

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading vendors...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-black-400">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="py-2 px-4 border text-left">Vendor No</th>
                                        <th className="py-2 px-4 border text-left">Vendor Name</th>
                                        <th className="py-2 px-4 border text-left">PAN</th>
                                        <th className="py-2 px-4 border text-left">GST Number</th>
                                        <th className="py-2 px-4 border text-left">Compliance Status</th>
                                        <th className="py-2 px-4 border text-left">PAN Status</th>
                                        <th className="py-2 px-4 border text-left">Emails</th>
                                        <th className="py-2 px-4 border text-left">Phone Numbers</th>
                                        <th className="py-2 px-4 border text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentVendors.length > 0 ? currentVendors.map(v => (
                                        <tr key={v._id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border">{v.vendorNo}</td>
                                            <td className="py-2 px-4 border">{v.vendorName}</td>
                                            <td className="py-2 px-4 border">{v.PAN}</td>
                                            <td className="py-2 px-4 border">{v.GSTNumber}</td>
                                            <td className="py-2 px-4 border">{v.complianceStatus}</td>
                                            <td className="py-2 px-4 border">{v.PANStatus}</td>
                                            <td className="py-2 px-4 border">{v.emailIds.join(', ')}</td>
                                            <td className="py-2 px-4 border">{v.phoneNumbers.join(', ')}</td>
                                            <td className="py-2 px-4 border">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(v)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm"
                                                    >
                                                        <img src={pen} alt="edit" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(v)}
                                                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm"
                                                    >
                                                        <img src={bin} alt="delete" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4 text-gray-500">No vendors found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-600">
                                Showing {indexOfFirstVendor + 1} to {Math.min(indexOfLastVendor, vendorData.length)} of {vendorData.length} vendors
                            </div>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                >
                                    Prev
                                </button>

                                {[...Array(totalPages).keys()].map(number => (
                                    <button
                                        key={number + 1}
                                        onClick={() => paginate(number + 1)}
                                        className={`px-3 py-1 rounded ${currentPage === number + 1 ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                    >
                                        {number + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-[10px] bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 w-full max-w-xl">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-bold">Edit Vendor</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="mb-2">
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Vendor Name
                                    </label>
                                    <input
                                        type="text"
                                        name="vendorName"
                                        value={editVendor?.vendorName || ''}
                                        onChange={handleInputChange}
                                        className="border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Vendor No
                                    </label>
                                    <input
                                        type="text"
                                        name="vendorNo"
                                        value={editVendor?.vendorNo || ''}
                                        onChange={handleInputChange}
                                        className="border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 font-medium mb-1">
                                        PAN
                                    </label>
                                    <input
                                        type="text"
                                        name="PAN"
                                        value={editVendor?.PAN || ''}
                                        onChange={handleInputChange}
                                        className="border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 font-medium mb-1">
                                        GST Number
                                    </label>
                                    <input
                                        type="text"
                                        name="GSTNumber"
                                        value={editVendor?.GSTNumber || ''}
                                        onChange={handleInputChange}
                                        className="border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Compliance Status
                                    </label>
                                    <select
                                        name="complianceStatus"
                                        value={editVendor?.complianceStatus || ''}
                                        onChange={handleInputChange}
                                        className="border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Compliant">Compliant</option>
                                        <option value="Non-Compliant">Non-Compliant</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>

                                <div className="mb-2">
                                    <label className="block text-gray-700 font-medium mb-1">
                                        PAN Status
                                    </label>
                                    <select
                                        name="PANStatus"
                                        value={editVendor?.PANStatus || ''}
                                        onChange={handleInputChange}
                                        className="border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Valid">Valid</option>
                                        <option value="Invalid">Invalid</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>

                                <div className="col-span-2 grid grid-cols-2 gap-3">
                                    <div className="mb-2">
                                        <label className="block text-gray-700 font-medium mb-1">
                                            Email IDs (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="emailIds"
                                            value={editVendor?.emailIds.join(', ') || ''}
                                            onChange={(e) => handleArrayInputChange(e, 'emailIds')}
                                            className="border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="mb-2">
                                        <label className="block text-gray-700 font-medium mb-1">
                                            Phone Numbers (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            name="phoneNumbers"
                                            value={editVendor?.phoneNumbers.join(', ') || ''}
                                            onChange={(e) => handleArrayInputChange(e, 'phoneNumbers')}
                                            className="border rounded w-full py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-3 space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
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
            {showDeleteModal && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-[10px] bg-opacity-50 flex items-center justify-center z-50">
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
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Vendor'}
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