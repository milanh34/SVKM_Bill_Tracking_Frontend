import React, { useState } from "react";
import cross from "../../assets/cross.svg";
import { workflowUpdate } from "../../apis/workflow.api";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SendBox = ({ closeWindow, selectedBills, billsData, singleRole }) => {
    const [recipientName, setRecipientName] = useState('');
    // const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedBillDetails = selectedBills.map(billId => {
        const bill = billsData.find(b => b._id === billId);
        return bill 
            ? `${bill.srNo} - ${bill.vendorName} (₹${bill.taxInvAmt?.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })})`
            : billId;
    });

    console.log(selectedBills, billsData, singleRole);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipientName.trim()) {
            toast.error("Please enter recipient name");
            return;
        }

        // Validate workflow sequence based on current bill state
        const invalidBills = selectedBills.filter(billId => {
            const bill = billsData.find(b => b._id === billId);
            if (!bill) return true;

            const currentUserRole = Cookies.get("userRole");

            return false;
        });

        if (invalidBills.length > 0) {
            toast.error("Some bills don't meet the required workflow conditions");
            return;
        }

        setLoading(true);
        let toRoleVariable;
        if(Cookies.get("userRole") === "site_officer") {
            toRoleVariable = "site_team";
        }else if(Cookies.get("userRole") === "qs_site") {
            toRoleVariable = "qs_team";
        }else if(Cookies.get("userRole") === "director") {
            toRoleVariable = "trustee";
        }else if(Cookies.get("userRole") === "site_pimo") {
            toRoleVariable = "pimo_mumbai";
        } else if(Cookies.get("userRole") === "accounts") {
            toRoleVariable = "accounts_department";
        } else{
            toRoleVariable = Cookies.get("userRole");
        }
        try {
            const fromUser = {
                id: Cookies.get("userId"),
                name: Cookies.get("userName"),
                role: toRoleVariable
            };

            const toUser = {
                id: "",
                name: recipientName,
                role: singleRole.value
            };
            console.log(fromUser, toUser);

            const res = await axios.post(workflowUpdate, {
                fromUser,
                toUser,
                billIds: selectedBills,
                action: "forward",
                remarks: ""
            });

            if (res.data.success) {
                toast.success(res.data.message);
                setTimeout(() => closeWindow(), 3000);
            } else {
                toast.warning(res.data.message);
            }

        } catch (error) {
            console.error("Error sending bills:", error);
            const errorMessage = error.response?.data?.message || "Failed to send bills. Please try again.";
            toast.error(errorMessage);
            
            if (error.response?.data?.data?.failed?.length > 0) {
                error.response.data.data.failed.forEach(failure => {
                    toast.error(`Bill ${failure.billId}: ${failure.message}`);
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="relative bg-white p-6 rounded-lg w-full max-w-[500px] z-[1001] shadow-xl max-h-[90vh] overflow-y-auto">
                <ToastContainer />
                <button className="absolute top-2 right-2 bg-transparent border-none cursor-pointer p-1 hover:bg-gray-100 rounded-full" 
                    onClick={closeWindow}
                    disabled={loading}
                >
                    <img src={cross} alt="close" />
                </button>

                <form className="flex flex-col gap-4 mt-2.5" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-gray-700">Send To:</label>
                        <input
                            type="text"
                            placeholder="Enter recipient name"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded text-base focus:outline-none focus:border-gray-400"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-gray-700">Selected Bills:</label>
                        <div className="max-h-[200px] overflow-y-auto bg-white border border-gray-300 rounded p-2">
                            {selectedBillDetails.map((bill, index) => (
                                <div key={index} className="p-2 border-b border-gray-200 text-sm last:border-b-0 text-gray-700 flex justify-between items-center">
                                    <span className="flex-1">{bill}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-gray-700">Remarks:</label>
                        <textarea 
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded text-base min-h-[120px] resize-y focus:outline-none focus:border-gray-400 text-gray-700"
                        />
                    </div> */}

                    <div className="flex gap-4 justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`px-8 py-2.5 rounded text-base cursor-pointer text-white transition-all duration-200 
                                ${loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#1a8d1a] hover:bg-[#158515] focus:ring-2 focus:ring-offset-2 focus:ring-[#1a8d1a]'
                                }`}
                        >
                            {loading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default SendBox;

