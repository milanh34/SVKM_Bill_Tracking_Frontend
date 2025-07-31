import Header from '../components/Header';
import { useState, useEffect } from 'react'
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
import { toast } from 'react-toastify';
import { importExcel } from '../apis/bills.api';
import { EditIcon, Upload, X } from 'lucide-react';

const Admin = () => {
    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTable, setActiveTable] = useState('vendors')
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()
    const [openUpdateBillModal, setOpenUpdateBillModal] = useState(false);

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
            toast.error('Only .xlsx, .xls, .csv files are allowed');
            event.target.value = '';
            return;
        }

        const formData = new FormData()
        formData.append('file', file)

        setLoading(true);
        try {
            const response = await axios.post(`${importExcel}/import-report`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response.data);

            toast.success('File imported successfully');
        } catch (error) {
            console.error('Error importing file:', error);
            toast.error(error.response?.data?.message || 'Error importing file');
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
            {isAdmin ? (
                <div className="mt-5 p-5">
                    <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
                    <div className="mb-8">
                        
                <button
                  className="flex items-center hover:cursor-pointer space-x-1 px-3 py-1.5 text-white text-sm bg-[#011a99] border border-gray-300 rounded-md hover:bg-blue-800 transition-colors"
                  onClick={() => setOpenUpdateBillModal(true)}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Import Bills
                </button>

                {
                  openUpdateBillModal && <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">

                      <button 
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        onClick={() => setOpenUpdateBillModal(false)}
                      >
                        <X className="text-red-500 cursor-pointer" />
                      </button>

                      <div className="mt-5 text-center">
                        <p className="mb-2 font-semibold">Import A File For Bills</p>
                        <p className="mb-2">Here is a link to preview the required format.</p>
                        <p>
                          link: <a href="#" className="text-blue-600 underline">helloworld.com</a>
                        </p>

                        <label
                          htmlFor="fileInput"
                          className="inline-block mt-6 bg-[#364cbb] text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition duration-200 hover:bg-[#2a3c9e] hover:-translate-y-0.5 shadow-md"
                        >
                          Import Bills (Import File)
                          <input
                            type="file"
                            id="fileInput"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={loading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                }

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