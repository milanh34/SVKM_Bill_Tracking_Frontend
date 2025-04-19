import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailIcon from "../assets/email.svg";
import passwordIcon from "../assets/password.svg";
import eyeIcon from "../assets/eye.svg";
import LoginHeader from "../components/login/LoginHeader";
import { ChevronDown } from "lucide-react";
import { login } from "../apis/user.apis";
import axios from "axios";
import Cookies from "js-cookie";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { value: "Site_Officer", label: "Site Officer" },
    { value: "QS_Team", label: "QS Team" },
    {
      value: "PIMO_Mumbai_&_MIGO/SES_Team",
      label: "PIMO Mumbai & MIGO/SES Team",
    },
    {
      value: "PIMO_Mumbai_for_Advance_&_FI_Entry",
      label: "PIMO Mumbai for Advance & FI Entry",
    },
    { value: "Accounts_Team", label: "Accounts Team" },
    {
      value: "Trustee,_Advisor_&_Director",
      label: "Trustee, Advisor & Director",
    },
    { value: "Admin", label: "Admin" },
  ];

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const validateRole = (selectedRole, userRole) => {
    const roleMap = {
      Site_Officer: "site_officer",
      QS_Team: "qs_site",
      "PIMO_Mumbai_&_MIGO/SES_Team": "site_pimo",
      "PIMO_Mumbai_for_Advance_&_FI_Entry": "pimo_mumbai",
      Accounts_Team: "accounts",
      "Trustee,_Advisor_&_Director": "director",
      Admin: "admin",
    };

    return roleMap[selectedRole] === userRole;
  };

  const handleLogin = async () => {
    setEmailError(false);
    setPasswordError(false);

    let hasError = false;

    if (!email.trim()) {
      setEmailError(true);
    }

    if (!password.trim()) {
      setPasswordError(true);
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      hasError = true;
    } else if (!password.trim()) {
      toast.error("Please enter your password");
      hasError = true;
    } else if (!selectedRole) {
      toast.error("Please select a role");
      hasError = true;
    } else if (!isTermsAgreed) {
      toast.error("Please agree to the terms and conditions");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      const response = await axios.post(login, {
        email,
        password,
      });
      console.log("Login response:", response.data);

      if (!validateRole(selectedRole, response.data.user.role)) {
        toast.error(
          `You are not authorized as ${selectedRole.replace(/_/g, " ")}`
        );
        return;
      }

      const cookieExpiry = 0.333;
      Cookies.set("token", response.data.token, { expires: cookieExpiry });
      Cookies.set("userRole", response.data.user.role, {
        expires: cookieExpiry,
      });
      Cookies.set("userEmail", response.data.user.email, {
        expires: cookieExpiry,
      });
      Cookies.set("userId", response.data.user.id, { expires: cookieExpiry });
      Cookies.set("userName", response.data.user.name, { expires: cookieExpiry });

      toast.success("Login Successfull!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col h-screen">
      <LoginHeader />
      <ToastContainer />
      <div className="flex flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 pb-2 sm:pb-3 h-full">
        <div className="w-full lg:w-2/5 xl:w-1/2 bg-[#F3F3F3] rounded-xl p-3 sm:p-5 lg:p-8 mb-4 lg:mb-0 order-2 lg:order-1 h-[50vh]">
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#01073F]">
            About Us
          </h2>
          <br className="hidden sm:block" />
          <p className="text-[#595959] font-medium text-xs sm:text-sm lg:text-sm xl:text-base">
            Shri Vile Parle Kelavani Mandal is a Public Charitable Trust
            registered under the Society's Registration Act and Bombay Public
            Trust Act. From its humble beginnings in 1934, when it took over the
            Rashtriya Shala, a school established in 1921 in the wake of the
            National Movement, the Mandal today has grown into a big educational
            complex imparting high-level education to more than 35,000 students.
          </p>
        </div>

        <div className="w-full h-full sm:w-5/6 md:w-3/4 lg:w-1/2 xl:w-2/5 border-2 border-gray-300/50 rounded-2xl bg-white flex flex-col items-center justify-between p-4 xl:p-6 gap-4 sm:gap-6 shadow-sm order-1 lg:order-2">
          <div className="flex flex-col items-center w-full justify-around h-full">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#01073F] text-center">
              Login to your account
            </h1>

            <div className="w-full sm:w-5/6 lg:w-4/6 relative">
              <div className="relative border border-gray-400/50 rounded-xl shadow-sm">
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full bg-white text-gray-600 xl:py-2 xl:px-4 py-1 px-3 rounded-xl text-base hover:cursor-pointer appearance-none outline-none"
                >
                  <option value="" disabled hidden>
                    Select Role
                  </option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-11/12 lg:w-5/6 border-2 border-gray-300/50 rounded-xl p-3 xl:p-5">
            <div className="w-full sm:w-11/12 lg:w-10/12 mx-auto">
              <div className="xl:mb-6 lg:mb-3 sm:mb-2 flex items-center">
                <img
                  src={emailIcon}
                  alt="email"
                  className="xl:w-6 xl:h-6 sm:h-4 sm:w-4 flex-shrink-0"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${
                    emailError ? "border-red-500" : ""
                  }`}
                />
              </div>

              <div className="flex items-center relative">
                <img
                  src={passwordIcon}
                  alt="password"
                  className="xl:w-6 xl:h-6 sm:h-4 sm:w-4 flex-shrink-0"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                  }}
                  className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${
                    passwordError ? "border-red-500" : ""
                  }`}
                />
                <div
                  onClick={togglePasswordVisibility}
                  className="absolute right-0 cursor-pointer"
                >
                  <img
                    src={eyeIcon}
                    alt="toggle password visibility"
                    className="xl:w-5 xl:h-5 sm:h-4 sm:w-4"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <p className="text-[#011A99] text-xs sm:text-sm xl:text-base cursor-pointer hover:text-[#021678]">
                  forgot password?
                </p>
              </div>

              <div className="mt-4 sm:mt-6 lg:mt-8 xl:mt-10">
                <div className="flex items-start mb-1 lg:mb-3 xl:mb-5">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={isTermsAgreed}
                    onChange={() => setIsTermsAgreed(!isTermsAgreed)}
                    className="appearance-none xl:w-4 xl:h-4 w-3 h-3 rounded-full border-2 border-[#011A99] checked:bg-[#011A99] mt-1 mr-2 flex-shrink-0"
                  />
                  <label
                    htmlFor="terms"
                    className="text-[#011A99] text-xs sm:text-sm xl:text-base"
                  >
                    I agree with the terms and conditions.
                  </label>
                </div>

                <button
                  className="w-full bg-[#011A99] text-white rounded-2xl py-2 xl:py-3 font-semibold hover:bg-[#021678] transition-colors duration-200 cursor-pointer text-xs sm:text-sm xl:text-base"
                  onClick={handleLogin}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
