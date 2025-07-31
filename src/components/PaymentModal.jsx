import { useState } from "react";
import cross from "../assets/cross.svg";
import axios from "axios";
import { paymentInstructions } from "../apis/bills.api";
import { toast } from "react-toastify";

const PaymentModal = ({ closeWindow, selectedBills, billsData, fetchBills }) => {
    const [remark, setRemark] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const selectedBillDetails = selectedBills.map(billId => {
        const bill = billsData.find(b => b._id === billId);
        return bill 
            ? `${bill.srNo} - ${bill.vendorName} (₹${bill.taxInvAmt?.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })})`
            : billId;
    });

    const handleSave = async (e) => {
        e.preventDefault();
        if (!remark.trim()) {
            toast.error("Please enter pay instructions");
            setShowLoader(true);
            setTimeout(() => setShowLoader(false), 500);
            return;
        }
        setLoading(true);
        try {
            await Promise.all(selectedBills.map(srNo =>
                axios.patch(`${paymentInstructions}/${srNo}`, {
                    paymentInstructions: remark
                })
            ));
            toast.success(`Remarks saved for ${selectedBills.length} bill(s).`);
            if (fetchBills) await fetchBills();
            setShowLoader(true);
            setTimeout(() => {
                setShowLoader(false);
                closeWindow();
            }, 500);
        } catch (err) {
            toast.error("Failed to save remarks. Please try again.");
            setShowLoader(true);
            setTimeout(() => setShowLoader(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="relative bg-white p-6 rounded-lg w-full max-w-[500px] z-[1001] shadow-xl max-h-[90vh] overflow-y-auto">
                <button className="absolute top-2 right-2 bg-transparent border-none cursor-pointer p-1 hover:bg-gray-100 rounded-full" onClick={closeWindow}>
                    <img src={cross} alt="close" />
                </button>

                <form className="flex flex-col gap-4 mt-2.5" onSubmit={handleSave}>
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

                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-gray-700">Pay instructions:</label>
                        <textarea
                            className="w-full p-3 bg-white border border-gray-300 rounded text-base min-h-[120px] resize-y focus:outline-none focus:border-gray-400 text-gray-700"
                            value={remark}
                            onChange={e => setRemark(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="flex gap-4 justify-end">
                        <button type="submit" disabled={loading || showLoader} className="px-8 py-2.5 rounded text-base cursor-pointer text-white transition-all duration-200 bg-[#1a8d1a] hover:bg-[#158515] focus:ring-2 focus:ring-offset-2 focus:ring-[#1a8d1a]">
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
                {showLoader && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-[1002]">
                        <div className="loader border-4 border-gray-300 border-t-[#1a8d1a] rounded-full w-12 h-12 animate-spin"></div>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaymentModal;
