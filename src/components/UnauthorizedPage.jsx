import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { AlertCircle } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 flex justify-center items-center p-8 text-center">
        <div className="max-w-lg bg-white p-10 rounded-xl shadow-lg border border-[#4E4E4E25]">
          <div className="flex items-center justify-center gap-3 mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h1 className="text-red-600 text-3xl font-bold">
              Unauthorized Access
            </h1>
          </div>

          <p className="text-lg mb-4 text-gray-800">
            You do not have permission to access this page.
          </p>

          <p className="text-sm text-gray-600 mb-8 border-l-4 border-red-500 bg-red-50 p-4 text-left">
            If you think this is a mistake, try switching in with a different
            role.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg border border-[#364CBB] text-[#364CBB] font-semibold 
                hover:bg-gray-50 hover:shadow-md cursor-pointer transform hover:scale-105 
                transition-all duration-300"
            >
              Go Back
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 rounded-lg bg-[#364CBB] text-white font-semibold 
                hover:bg-[#2A3C9E] hover:shadow-md cursor-pointer transform hover:scale-105 
                transition-all duration-300"
            >
              Login Again
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UnauthorizedPage;
