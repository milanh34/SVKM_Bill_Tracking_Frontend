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

const Admin = () => {
    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTable, setActiveTable] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const userRole = Cookies.get('userRole')
        const token = Cookies.get('token')

        if (!userRole || !token) {
            navigate('/login')
            return
        }

        setIsAdmin(userRole === 'admin')
    }, [navigate])

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            await axios.post(importReport, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            alert('File imported successfully')
        } catch (error) {
            console.error('Error importing file:', error)
            alert('Error importing file')
        }
    }

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
                    {/* Title Section */}
                    <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

                    {/* Import File Section */}
                    <div className="mb-8">
                        <label
                            htmlFor="fileInput"
                            className="bg-[#364cbb] text-white font-semibold px-[1.4vw] py-[0.5vw] rounded-[1vw] border-none cursor-pointer whitespace-nowrap text-[0.9vw] transition-all duration-200 hover:bg-[#2a3c9e] hover:-translate-y-0.5 shadow-md"
                        >
                            Import Flat File
                            <input
                                type="file"
                                id="fileInput"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Master Tables Section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Master Tables</h2>
                        <AdminBtns activeTable={activeTable} setActiveTable={setActiveTable} />
                    </div>

                    {/* Table Display Section */}
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