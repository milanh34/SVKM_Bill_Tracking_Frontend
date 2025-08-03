import Header from "../components/Header";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import AdminBtns from "../components/admin/AdminBtns";
import VendorTable from "../components/admin/VendorTable";
import ComplianceTable from "../components/admin/ComplianceTable";
import PanStatusTable from "../components/admin/PanStatusTable";
import RegionTable from "../components/admin/RegionTable";
import NatureOfWorkTable from "../components/admin/NatureOfWorkTable";
import UserTable from "../components/admin/UserTable";
import CurrencyTable from "../components/admin/CurrencyTable";
import { UpdateBillModal } from "../components/dashboard/UpdateBillModal";
import { Upload } from "lucide-react";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTable, setActiveTable] = useState("vendors");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [openUpdateBillModal, setOpenUpdateBillModal] = useState(false);

  useEffect(() => {
    const userRole = Cookies.get("userRole");
    const token = Cookies.get("token");

    if (!userRole || !token) {
      navigate("/login");
      return;
    }

    setIsAdmin(userRole === "admin");
  }, [navigate]);

  const renderActiveTable = () => {
    switch (activeTable) {
      case "users":
        return <UserTable />;
      case "vendors":
        return <VendorTable />;
      case "compliances":
        return <ComplianceTable />;
      case "panstatus":
        return <PanStatusTable />;
      case "regions":
        return <RegionTable />;
      case "nature-of-works":
        return <NatureOfWorkTable />;
      case "currencies":
        return <CurrencyTable />;
      default:
        return (
          <div className="text-center mt-4 text-gray-500">
            Please select a table to view
          </div>
        );
    }
  };

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

            {openUpdateBillModal && (
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[60] flex items-center justify-center">
                <UpdateBillModal
                  setOpenUpdateBillModal={setOpenUpdateBillModal}
                  loading={loading}
                  setLoading={setLoading}
                  patch={false}
                />
              </div>
            )}

            {loading && (
              <span className="ml-4 align-middle">
                <svg
                  className="animate-spin h-6 w-6 text-[#364cbb] inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Master Tables
            </h2>
            <AdminBtns
              activeTable={activeTable}
              setActiveTable={setActiveTable}
            />
          </div>

          <div className="mt-8">{renderActiveTable()}</div>
        </div>
      ) : (
        <div className="mt-12 text-center text-red-500 text-lg">
          You are not authorized. This page is only accessible to
          administrators.
        </div>
      )}
    </div>
  );
};

export default Admin;
