import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import axios from "axios";
import { user, updatePassword } from "../apis/user.apis";
import { User, Mail, Building2, MapPin, Clock, Calendar, Eye, EyeOff } from "lucide-react";
import Loader from "../components/Loader";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [saving, setSaving] = useState(false);
  // Show/hide on each password field (6.10, item 38).
  const [showPw, setShowPw] = useState({});
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  /**
   * Change the signed-in user's own password (observation N-12).
   *
   * PUT /auth/update-password already existed and verifies the current
   * password server-side; it simply had no way in from the interface. It
   * answers with a fresh token, which replaces the one in the cookie so the
   * session survives the change.
   */
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("The new passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("The new password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword === passwords.currentPassword) {
      toast.error("The new password must be different from the current one");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put(
        updatePassword,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
      );

      if (response.data?.token) {
        Cookies.set("token", response.data.token, { expires: 0.333 });
      }

      toast.success("Password updated");
      setShowPasswordForm(false);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not update the password"
      );
    } finally {
      setSaving(false);
    }
  };

  const roleDisplayMap = {
    site_officer: "IMD Site Team",
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

              {/*
                Change password (observation N-12). The endpoint already
                existed and checks the current password; there was simply no
                way to reach it from the interface.
              */}
              <div className="pt-6 border-t border-gray-200">
                {!showPasswordForm ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(true)}
                    className="px-4 py-2 bg-[#011a99] text-white rounded-md text-sm font-medium hover:bg-[#01147a] transition-colors"
                  >
                    Change password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="max-w-md space-y-3">
                    <h2 className="text-lg font-semibold text-gray-800">Change password</h2>

                    <div>
                      <label htmlFor="currentPassword" className="block text-sm text-gray-600 mb-1">
                        Current password
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          type={showPw.currentPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={passwords.currentPassword}
                          onChange={(e) =>
                            setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                          }
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#011a99]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => ({ ...v, currentPassword: !v.currentPassword }))}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                          aria-label={showPw.currentPassword ? "Hide password" : "Show password"}
                          title={showPw.currentPassword ? "Hide password" : "Show password"}
                        >
                          {showPw.currentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm text-gray-600 mb-1">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showPw.newPassword ? "text" : "password"}
                          autoComplete="new-password"
                          minLength={6}
                          value={passwords.newPassword}
                          onChange={(e) =>
                            setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                          }
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#011a99]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => ({ ...v, newPassword: !v.newPassword }))}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                          aria-label={showPw.newPassword ? "Hide password" : "Show password"}
                          title={showPw.newPassword ? "Hide password" : "Show password"}
                        >
                          {showPw.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">At least 6 characters.</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-1">
                        Confirm new password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showPw.confirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={passwords.confirmPassword}
                          onChange={(e) =>
                            setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                          }
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#011a99]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => ({ ...v, confirmPassword: !v.confirmPassword }))}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                          aria-label={showPw.confirmPassword ? "Hide password" : "Show password"}
                          title={showPw.confirmPassword ? "Hide password" : "Show password"}
                        >
                          {showPw.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-[#011a99] text-white rounded-md text-sm font-medium hover:bg-[#01147a] disabled:bg-gray-400 transition-colors"
                      >
                        {saving ? "Saving…" : "Update password"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
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
