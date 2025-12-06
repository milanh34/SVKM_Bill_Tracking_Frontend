import React from 'react'
import Header from '../components/Header'
import VendorTable from '../components/admin/VendorTable'
import Cookies from "js-cookie";
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

// This page is for accounts role.
const VendorTablePage = () => {
  const role = Cookies.get('userRole');
  const navigate = useNavigate();

  const handleLoginAgain = () => {
    navigate("/login");
  }

  return (
    role === "accounts" ? <div>
      <Header />
      <div className='p-5'>
        <VendorTable />
      </div>
    </div>
      : <div>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 md:p-12">
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-600 mr-4" />
              <h1 className="text-4xl font-bold text-red-600">
                Unauthorized Access
              </h1>
            </div>

            <p className="text-xl text-gray-700 text-center mb-8">
              You do not have permission to access this page.
            </p>
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-8">
              <p className="text-gray-700">
                If you think this is a mistake, try switching in with a different role.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLoginAgain}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Login Again
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default VendorTablePage
