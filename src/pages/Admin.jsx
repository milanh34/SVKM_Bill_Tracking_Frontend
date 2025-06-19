import Header from '../components/Header';
import { useState, useEffect } from 'react'
import { importReport } from '../apis/bills.api'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import AdminBtns from '../components/admin/AdminBtns';
import VendorTable from "../components/admin/VendorTable";
import ComplianceTable from '../components/admin/ComplianceTable';
import PanStatusTable from "../components/admin/PanStatusTable";
import RegionTable from "../components/admin/RegionTable";
import NatureOfWorkTable from "../components/admin/NatureOfWorkTable";
import UserTable from "../components/admin/UserTable";
import CurrencyTable from "../components/admin/CurrencyTable";
import Toast from '../components/Toast';

const Admin = () => {
    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTable, setActiveTable] = useState('vendors')
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate()

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        const allowedExtensions = /\.(xlsx|xls|csv)$/i;

        if (
            !allowedTypes.includes(file.type) &&
            !allowedExtensions.test(file.name)
        ) {
            showToast('Only .xlsx, .xls, .csv files are allowed', 'error');
            event.target.value = '';
            return;
        }

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true);
        try {
            const response = await axios.post(importReport, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            showToast('File imported successfully', 'success');
        } catch (error) {
            console.error('Error importing file:', error);
            showToast(error.response?.data?.message || 'Error importing file', 'error');
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    }

    useEffect(() => {
        const userRole = Cookies.get('userRole')
        const token = Cookies.get('token')

        if (!userRole || !token) {
            navigate('/login')
            return
        }

        setIsAdmin(userRole === 'admin')
    }, [navigate])

    const renderActiveTable = () => {
        switch(activeTable) {
            case 'users':
                return <UserTable />;
            case 'vendors':
                return <VendorTable />;
            case 'compliances':
                return <ComplianceTable />;
            case 'panstatus':
                return <PanStatusTable />;
            case 'regions':
                return <RegionTable />;
            case 'nature-of-works':
                return <NatureOfWorkTable />;
            case 'currencies':
                return <CurrencyTable />;
            default:
                return <div className="text-center mt-4 text-gray-500">Please select a table to view</div>;
        }
    }

    return (
        <div>
            <Header />
            {toast && (
                <Toast 
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {isAdmin ? (
                <div className="mt-5 p-5">
                    <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
                    <div className="mb-8">
                        <label
                            htmlFor="fileInput"
                            className="bg-[#364cbb] text-white font-semibold px-[1.4vw] py-[0.5vw] rounded-[1vw] border-none cursor-pointer whitespace-nowrap text-[0.9vw] transition-all duration-200 hover:bg-[#2a3c9e] hover:-translate-y-0.5 shadow-md"
                        >
                            Import Flat File
                            <input
                                type="file"
                                id="fileInput"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={loading}
                            />
                        </label>
                        {loading && (
                            <span className="ml-4 align-middle">
                                <svg className="animate-spin h-6 w-6 text-[#364cbb] inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                            </span>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Master Tables</h2>
                        <AdminBtns activeTable={activeTable} setActiveTable={setActiveTable} />
                    </div>

                    <div className="mt-8">
                        {renderActiveTable()}
                    </div>
                </div>
            ) : (
                <div className="mt-12 text-center text-red-500 text-lg">
                    You are not authorized. This page is only accessible to administrators.
                </div>
            )}
        </div>
    )
}

export default Admin