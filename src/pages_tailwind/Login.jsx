import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import email from "../assets/email.svg";
import password from "../assets/password.svg";
import eye from "../assets/eye.svg";
import LoginHeader from "../components_tailwind/login/LoginHeader";
import { ChevronDown } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
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

  const handleLogin = () => {
    if (selectedRole) {
      localStorage.setItem("userRole", selectedRole);
      navigate("/");
    } else {
      alert("Please select a role before logging in.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col h-screen">
      <LoginHeader />
      <div className="flex flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 pb-2 sm:pb-3 h-full">
        <div className="w-full lg:w-2/5 xl:w-1/2 bg-[#F3F3F3] rounded-xl p-3 sm:p-5 lg:p-8 mb-4 lg:mb-0 order-2 lg:order-1 h-[50vh]">
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-[#01073F]">
            About Us
          </h2>
          <br className="hidden sm:block" />
          <p className="text-[#595959] font-medium text-xs sm:text-sm lg:text-base">
            Shri Vile Parle Kelavani Mandal is a Public Charitable Trust
            registered under the Society's Registration Act and Bombay Public
            Trust Act. From its humble beginnings in 1934, when it took over the
            Rashtriya Shala, a school established in 1921 in the wake of the
            National Movement, the Mandal today has grown into a big educational
            complex imparting high-level education to more than 35,000 students.
          </p>
        </div>

        <div className="w-full h-full sm:w-5/6 md:w-3/4 lg:w-1/2 xl:w-2/5 border-2 border-gray-300/50 rounded-2xl bg-white flex flex-col items-center justify-between p-4 sm:p-6 gap-4 sm:gap-6 shadow-sm order-1 lg:order-2">
          <div className="flex flex-col items-center w-full justify-around h-full">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#01073F] text-center">
              Login to your account
            </h1>

            <div className="w-full sm:w-5/6 lg:w-4/6 relative">
              <div className="relative border border-gray-400/50 rounded-xl shadow-sm">
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full bg-white text-gray-600 py-2 px-4 rounded-xl text-base hover:cursor-pointer appearance-none outline-none"
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

          <div className="w-full sm:w-11/12 lg:w-5/6 border-2 border-gray-300/50 rounded-xl p-3 sm:p-5">
            <div className="w-full sm:w-11/12 lg:w-10/12 mx-auto">
              <div className="mb-6 flex items-center">
                <img
                  src={email}
                  alt="email"
                  className="w-6 h-6 flex-shrink-0"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base sm:text-lg py-1"
                />
              </div>

              <div className="flex items-center relative">
                <img
                  src={password}
                  alt="password"
                  className="w-6 h-6 flex-shrink-0"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base sm:text-lg py-1"
                />
                <div
                  onClick={togglePasswordVisibility}
                  className="absolute right-0 cursor-pointer"
                >
                  <img
                    src={eye}
                    alt="toggle password visibility"
                    className="w-5 h-5"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <p className="text-[#011A99] text-sm sm:text-base cursor-pointer hover:text-[#021678]">
                  forgot password?
                </p>
              </div>

              <div className="mt-8 sm:mt-10">
                <div className="flex items-start mb-5">
                  <input
                    type="checkbox"
                    id="terms"
                    className="appearance-none w-4 h-4 rounded-full border-2 border-[#011A99] checked:bg-[#011A99] mt-1 mr-2 flex-shrink-0"
                  />
                  <label
                    htmlFor="terms"
                    className="text-[#011A99] text-sm sm:text-base"
                  >
                    I agree with the terms and conditions.
                  </label>
                </div>

                <button
                  className="w-full bg-[#011A99] text-white rounded-2xl py-2 sm:py-3 font-semibold hover:bg-[#021678] transition-colors duration-200 cursor-pointer text-sm sm:text-base"
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
