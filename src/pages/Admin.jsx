import Header from '../components/Header';
import { useState, useEffect } from 'react'
import { importReport } from '../apis/bills.api'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import UserTable from "./UserTable";
import VendorTable from "./VendorTable";
import AdminBtns from '../components/AdminBtns';

const Admin = () => {
    const [isAdmin, setIsAdmin] = useState(false)
    const [activeTable, setActiveTable] = useState('users') // Default to users table
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
            // Add more cases for other tables as they are created
            default:
                return <div className="text-center mt-4">Table component not yet implemented</div>;
        }
    }

    return (
        <div>
            <Header />
            {isAdmin ? (
                <div className="mt-5 p-5">
                    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                    <AdminBtns activeTable={activeTable} setActiveTable={setActiveTable} />
                    <div className="mt-5">
                        <label
                            htmlFor="fileInput"
                            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer transition-colors duration-300 hover:bg-blue-700"
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
                    <div className="mt-5">
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