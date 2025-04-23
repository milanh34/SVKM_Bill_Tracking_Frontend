import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { forgotPassword, verifyResetCode, resetPassword } from "../apis/user.apis";
import emailIcon from "../assets/email.svg";
import passwordIcon from "../assets/password.svg";
import eyeIcon from "../assets/eye.svg";
import otpIcon from "../assets/otpIcon.svg";
import LoginHeader from "../components/login/LoginHeader";

const ForgotPassword = () => {
    // State for the multi-step form
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resendTimer, setResendTimer] = useState(10);
    const [canResend, setCanResend] = useState(false);

    // Error states
    const [emailError, setEmailError] = useState(false);
    const [otpError, setOtpError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);

    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    useEffect(() => {
        let interval;
        if (step === 2 && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        setCanResend(true);
                        clearInterval(interval);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }

        // Cleanup function
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, resendTimer]);

    const handleEmailSubmit = async () => {
        if (!email) {
            setEmailError(true);
            toast.error("Please enter your email");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError(true);
            toast.error("Please enter a valid email");
            return;
        }

        try {
            const response = await axios.post(forgotPassword, {
                "email": email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity
            });

            const data = response.data;
            console.log(data);

            toast.success("OTP sent to your email");
            setStep(2);
        }
        catch (err) {
            console.error(err);
            toast.error(err);
        }
    };

    const handleOtpSubmit = async () => {
        if (!otp) {
            setOtpError(true);
            toast.error("Please enter the OTP");
            return;
        }

        if (otp.length !== 6) {
            setOtpError(true);
            toast.error("OTP must be 6 digits");
            return;
        }

        try {
            const response = await axios.post(verifyResetCode, {
                "email": email,
                "code": otp
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity
            });

            const data = response.data;
            console.log(data);
            setResetToken(response.data.resetToken);

            toast.success("OTP verified successfully");
            setStep(3);
        }
        catch (err) {
            console.error(err);
            toast.error(err);
        }

    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        console.log("resend otp clicked");

        // Reset the states
        setResendTimer(10);
        setCanResend(false);

        try {
            const response = await axios.post(forgotPassword, {
                "email": email
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity
            });

            const data = response.data;
            console.log(data);

            toast.success("OTP sent again to your email");
            setStep(2);

            // 10 secs interval before clicking again
            const interval = setInterval(() => {
                setResendTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        setCanResend(true);
                        clearInterval(interval);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        catch (err) {
            console.error(err);
            toast.error(err);
        }
    }

    const handlePasswordReset = async () => {
        if (!newPassword) {
            setPasswordError(true);
            toast.error("Please enter a new password");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(true);
            toast.error("Password must be at least 8 characters long");
            return;
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError(true);
            toast.error("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post(resetPassword, {
                "resetToken": resetToken,
                "newPassword": newPassword,
                "confirmPassword": confirmPassword
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                maxBodyLength: Infinity
            });

            const data = response.data;
            console.log(data);

            toast.success("Password reset successfully");
            navigate('/login');
        }
        catch (err) {
            console.error(err);
            toast.error(err);
        }

    };

    const goBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    return (
        <div className="w-full min-h-screen bg-white flex flex-col h-screen">
            <LoginHeader />
            <ToastContainer />
            <div className="flex flex-row justify-center items-center gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 pb-2 sm:pb-3 h-full">
                <div className="w-full lg:w-2/5 xl:w-1/2 bg-[#F3F3F3] rounded-xl p-3 sm:p-5 lg:p-8 mb-4 lg:mb-0 order-2 lg:order-1 h-[50vh]">
                    <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-[#01073F]">
                        Reset Your Password
                    </h2>
                    <br className="hidden sm:block" />
                    <p className="text-[#595959] font-medium text-xs sm:text-sm lg:text-sm xl:text-base">
                        Forgot your password? Don't worry, we've got you covered. Follow these simple steps to reset your password and regain access to your account:
                        <br /><br />
                        1. Enter your registered email address<br />
                        2. Enter the OTP sent to your email<br />
                        3. Create a new password
                    </p>
                </div>

                <div className="w-full h-full sm:w-5/6 md:w-3/4 lg:w-1/2 xl:w-2/5 border-2 border-gray-300/50 rounded-2xl bg-white flex flex-col items-center justify-between p-4 xl:p-6 gap-4 sm:gap-6 shadow-sm order-1 lg:order-2">
                    <div className="flex flex-col items-center w-full justify-around h-full relative">
                        {step > 1 && (
                            <button
                                onClick={goBack}
                                className="absolute left-0 top-0 p-2 text-[#011A99] hover:text-[#021678]"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}

                        <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#01073F] text-center">
                            {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Create New Password"}
                        </h1>

                        <div className="w-full sm:w-5/6 lg:w-4/6 flex items-center justify-center">
                            <div className="flex items-center space-x-2 w-full justify-center">
                                <div className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-[#011A99]" : "bg-gray-300"}`}></div>
                                <div className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-[#011A99]" : "bg-gray-300"}`}></div>
                                <div className={`h-2 w-2 rounded-full ${step >= 3 ? "bg-[#011A99]" : "bg-gray-300"}`}></div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full sm:w-11/12 lg:w-5/6 border-2 border-gray-300/50 rounded-xl p-3 xl:p-5">
                        <div className="w-full sm:w-11/12 lg:w-10/12 mx-auto">
                            {step === 1 && (
                                <>
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
                                            className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${emailError ? "border-red-500" : ""
                                                }`}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        We'll send a verification code to this email
                                    </p>
                                    <div className="mt-4 sm:mt-6 lg:mt-8 xl:mt-10">
                                        <button
                                            className="w-full bg-[#011A99] text-white rounded-2xl py-2 xl:py-3 font-semibold hover:bg-[#021678] transition-colors duration-200 cursor-pointer text-xs sm:text-sm xl:text-base"
                                            onClick={handleEmailSubmit}
                                        >
                                            Send OTP
                                        </button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="xl:mb-6 lg:mb-3 sm:mb-2 flex items-center">
                                        <img
                                            src={otpIcon || passwordIcon} // Fallback to passwordIcon if otpIcon is not available
                                            alt="otp"
                                            className="xl:w-6 xl:h-6 sm:h-4 sm:w-4 flex-shrink-0"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => {
                                                // Allow only numbers and limit to 6 digits
                                                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                                setOtp(value);
                                                setOtpError(false);
                                            }}
                                            className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${otpError ? "border-red-500" : ""
                                                }`}
                                        />
                                    </div>
                                    <div className="flex justify-end mt-3" onClick={handleResendOtp}>
                                        <p className={`text-xs sm:text-sm xl:text-base cursor-pointer ${canResend ? "text-[#011A99] hover:text-[#021678]" : "text-gray-400"}`}>
                                            {canResend ? "Resend OTP" : `Resend OTP (${resendTimer}s)`}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Enter the 6-digit code sent to {email}
                                    </p>
                                    <div className="mt-4 sm:mt-6 lg:mt-8 xl:mt-10">
                                        <button
                                            className="w-full bg-[#011A99] text-white rounded-2xl py-2 xl:py-3 font-semibold hover:bg-[#021678] transition-colors duration-200 cursor-pointer text-xs sm:text-sm xl:text-base"
                                            onClick={handleOtpSubmit}
                                        >
                                            Verify OTP
                                        </button>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <div className="xl:mb-6 lg:mb-3 sm:mb-2 flex items-center relative">
                                        <img
                                            src={passwordIcon}
                                            alt="password"
                                            className="xl:w-6 xl:h-6 sm:h-4 sm:w-4 flex-shrink-0"
                                        />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setPasswordError(false);
                                            }}
                                            className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${passwordError ? "border-red-500" : ""
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

                                    <div className="xl:mb-6 lg:mb-3 sm:mb-2 flex items-center relative mt-4">
                                        <img
                                            src={passwordIcon}
                                            alt="confirm password"
                                            className="xl:w-6 xl:h-6 sm:h-4 sm:w-4 flex-shrink-0"
                                        />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setConfirmPasswordError(false);
                                            }}
                                            className={`ml-3 w-full border-b border-[#011A99] focus:outline-none text-[#01073F] text-base xl:text-lg py-1 ${confirmPasswordError ? "border-red-500" : ""
                                                }`}
                                        />
                                        <div
                                            onClick={toggleConfirmPasswordVisibility}
                                            className="absolute right-0 cursor-pointer"
                                        >
                                            <img
                                                src={eyeIcon}
                                                alt="toggle password visibility"
                                                className="xl:w-5 xl:h-5 sm:h-4 sm:w-4"
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-2">
                                        Create a password with at least 8 characters
                                    </p>

                                    <div className="mt-4 sm:mt-6 lg:mt-8 xl:mt-10">
                                        <button
                                            className="w-full bg-[#011A99] text-white rounded-2xl py-2 xl:py-3 font-semibold hover:bg-[#021678] transition-colors duration-200 cursor-pointer text-xs sm:text-sm xl:text-base"
                                            onClick={handlePasswordReset}
                                        >
                                            Reset Password
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;