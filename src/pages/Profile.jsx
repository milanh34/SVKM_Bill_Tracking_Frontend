import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axios from "axios";
import { user } from "../apis/user.apis";
import { User, Mail, Building2, MapPin, Clock, Calendar } from "lucide-react";
import Loader from "../components/Loader";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const roleDisplayMap = {
    site_officer: "Site Team",
    qs_site: "QS Team",
    site_pimo: "PIMO Mumbai Team", //changed from PIMO Mumbai & SES Team
    // 'pimo_mumbai': 'Advance & Direct FI Entry',
    accounts: "Accounts Team",
    director: "Trustee, Advisor & Director",
    admin: "Admin",
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(user, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setUserData(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch user profile");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <Loader text="Loading profile..." />
        ) : userData ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#011a99] px-6 py-4">
              <h1 className="text-2xl font-semibold text-white">
                Profile Details
              </h1>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Details */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-[#011a99]" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{userData.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-[#011a99]" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-[#011a99]" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{userData.department}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-[#011a99]" />
                    <div>
                      <p className="text-sm text-gray-500">Region</p>
                      <div className="flex flex-wrap gap-1">
                        {userData.region.map((region, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-100 rounded-full text-sm font-medium"
                          >
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-[#011a99]" />
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="font-medium">
                        {"on " +
                          userData.lastLogin.split("T")[0] +
                          " at " +
                          userData.lastLogin.split("T")[1].split(".")[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-[#011a99]" />
                    <div>
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="font-medium">
                        {"on " +
                          userData.createdAt.split("T")[0] +
                          " at " +
                          userData.createdAt.split("T")[1].split(".")[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {userData.role.map(
                    (role, index) =>
                      role !== "pimo_mumbai" && (
                        <div
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-[#011a99] rounded-full text-sm font-medium"
                        >
                          {roleDisplayMap[role] || role}
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No profile data available
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
