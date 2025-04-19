import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import emailIcon from "../assets/email.svg";
import passwordIcon from "../assets/password.svg";
import eyeIcon from "../assets/eye.svg";
import LoginHeader from "../components/login/LoginHeader";
import { ChevronDown, Cookie } from "lucide-react";
import { updatePassword } from "../apis/user.apis";
import axios from "axios";
import Cookies from "js-cookie";

const UpdatePassword = () => {

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwordError, setPasswordError] = useState(false);
    const navigate = useNavigate();


    const togglePasswordVisibility = (val) => {

        if (val === 'current') {
            setShowCurrentPassword(!showCurrentPassword);
        }
        if (val === 'new') {
            setShowNewPassword(!showNewPassword);
        }
        if (val === 'confirm') {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const handleUpdatePass = async () => {
        console.log("In handleUpdatePass");
        // setCurrentPassword(currentPassword.trim());
        // setNewPassword(newPassword.trim());
        // setConfirmPassword(confirmPassword.trim());

        if (newPassword.replace(/\s+/g, '') !== confirmPassword.replace(/\s+/g, '')) {
            toast.error("New and confirm passwords do not match");
            setPasswordError("New and confirm passwords do not match");
            return;
        }

        try {
            const response = await fetch(updatePassword, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token')}`
                },
                body: JSON.stringify({
                    "currentPassword": currentPassword.replace(/\s+/g, ''),
                    "newPassword": newPassword.replace(/\s+/g, '')
                    // currentPassword, newPassword
                })
            });
            const data = await response.json();
            console.log(data);
            console.log(data.token);

            if (!response.ok) {
                toast.error(data.message || "Failed to update password")
                setPasswordError(data.message || "Failed to update password");
            } else {
                Cookies.set('token', data.token, {
                    expires: 1 / 3  // 8 hours 
                });
                toast.success("Update Password Successfull!");
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        }
        catch (err) {
            console.error(err);
            toast.error(err);
            setPasswordError(err);
        }
    }

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
                            Update Password
                        </h1>
                    </div>

                    <div className="w-full sm:w-11/12 lg:w-5/6 border-2 border-gray-300/50 rounded-xl p-3 xl:p-5">
                        <div className="w-full sm:w-11/12 lg:w-10/12 mx-auto">
                            <div className="xl:mb-6 lg:mb-3 sm:mb-2 flex items-center relative">
                                <img
                                    src={passwordIcon}
                                    alt="current-password"
                                    className="xl:w-6 xl:h-6 sm:h-4 sm:w-4 flex-shrink-0"
                                />
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => {
                                        setCurrentPassword(e.target.value);
                                        setPasswordError(false);
                                    }}
                                    className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${passwordError ? "border-red-500" : ""
                                        }`}
                                />
                                <div
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-0 cursor-pointer"
                                >
                                    <img
                                        src={eyeIcon}
                                        alt="toggle password visibility"
                                        className="xl:w-5 xl:h-5 sm:h-4 sm:w-4"
                                    />
                                </div>
                            </div>

                            <div className="xl:mb-6 lg:mb-3 sm:mb-2 flex items-center relative">
                                <img
                                    src={passwordIcon}
                                    alt="new-password"
                                    className="xl:w-6 xl:h-6 sm:h-4 sm:w-4 flex-shrink-0"
                                />
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value.trim());
                                        setPasswordError(false);
                                    }}
                                    className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${passwordError ? "border-red-500" : ""
                                        }`}
                                />
                                <div
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-0 cursor-pointer"
                                >
                                    <img
                                        src={eyeIcon}
                                        alt="toggle password visibility"
                                        className="xl:w-5 xl:h-5 sm:h-4 sm:w-4"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center relative">
                                <img
                                    src={passwordIcon}
                                    alt="confirm-password"
                                    className="xl:w-6 xl:h-6 sm:h-4 sm:w-4 flex-shrink-0"
                                />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value.trim());
                                        setPasswordError(false);
                                    }}
                                    className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${passwordError ? "border-red-500" : ""
                                        }`}
                                />
                                <div
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-0 cursor-pointer"
                                >
                                    <img
                                        src={eyeIcon}
                                        alt="toggle password visibility"
                                        className="xl:w-5 xl:h-5 sm:h-4 sm:w-4"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-6 lg:mt-8 xl:mt-10">
                                <button
                                    className="w-full bg-[#011A99] text-white rounded-2xl py-2 xl:py-3 font-semibold hover:bg-[#021678] transition-colors duration-200 cursor-pointer text-xs sm:text-sm xl:text-base"
                                    onClick={handleUpdatePass}
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdatePassword