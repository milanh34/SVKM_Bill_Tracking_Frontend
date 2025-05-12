import React, { useState, useRef, useEffect } from "react";
import cross from "../assets/cross.svg";

const SendBox = ({ closeWindow, selectedBills, billsData, singleRole }) => {
    const [isRolesDropdownOpen, setIsRolesDropdownOpen] = useState(false);
    const [recipientName, setRecipientName] = useState('');
    const rolesDropdownRef = useRef(null);
    const [showToast, setShowToast] = useState(false);

    const roles = [
        { value: "Site_Officer", label: "Site Team" },
        { value: "QS_Team", label: "QS Team" },
        { value: "PIMO_Mumbai_&_SES_Team", label: "PIMO Mumbai & SES Team" },
        { value: "Advance_&_Direct_FI_Entry", label: "Advance & Direct FI Entry" },
        { value: "Accounts_Team", label: "Accounts Team" },
        { value: "Trustee,_Advisor_&_Director", label: "Trustee, Advisor & Director" },
        { value: "Admin", label: "Admin" }
    ];

    const [selectedRoles, setSelectedRoles] = useState(singleRole ? [singleRole.value] : []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rolesDropdownRef.current && !rolesDropdownRef.current.contains(event.target)) {
                setIsRolesDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRoleToggle = (role) => {
        setSelectedRoles(prev => {
            if (prev.includes(role.value)) {
                return prev.filter(r => r !== role.value);
            } else {
                return [...prev, role.value];
            }
        });
    };

    const handleSelectAllRoles = () => {
        if (selectedRoles.length === roles.length) {
            setSelectedRoles([]);
        } else {
            setSelectedRoles(roles.map(role => role.value));
        }
    };

    const selectedBillDetails = selectedBills.map(billId => {
        const bill = billsData.find(b => b._id === billId);
        return bill 
            ? `${bill.srNo} - ${bill.vendorName} (₹${bill.taxInvAmt?.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })})`
            : billId;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRoles.length === 0) {
            alert("Please select at least one role");
            return;
        }
        if (!recipientName.trim()) {
            alert("Please enter recipient name");
            return;
        }

        const selectedRoleLabels = selectedRoles
            .map(roleValue => roles.find(r => r.value === roleValue)?.label)
            .join(", ");

        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            closeWindow();
        }, 3000);
    };

    return (
        <>
            <div className="relative bg-white p-6 rounded-lg w-full max-w-[500px] z-[1001] shadow-xl max-h-[90vh] overflow-y-auto">
                <button className="absolute top-2 right-2 bg-transparent border-none cursor-pointer p-1 hover:bg-gray-100 rounded-full" onClick={closeWindow}>
                    <img src={cross} alt="close" />
                </button>

                <form className="flex flex-col gap-4 mt-2.5" onSubmit={handleSubmit}>
                    {!singleRole && (
                        <div className="flex flex-col gap-2">
                            <label className="text-base font-medium text-gray-700">Send to:</label>
                            <div className="relative w-full" ref={rolesDropdownRef}>
                                <button
                                    type="button"
                                    className="w-full p-3 bg-white border border-gray-300 rounded text-left text-base cursor-pointer outline-none transition-all duration-200 text-gray-700 appearance-none pr-8 hover:border-gray-400"
                                    onClick={() => setIsRolesDropdownOpen(!isRolesDropdownOpen)}
                                >
                                    {selectedRoles.length === 0
                                        ? "Select Roles"
                                        : selectedRoles.length === 1
                                            ? roles.find(r => r.value === selectedRoles[0])?.label
                                            : `${selectedRoles.length} Roles Selected`}
                                </button>

                                {isRolesDropdownOpen && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded p-1.5 shadow-lg max-h-[250px] overflow-y-auto z-50">
                                        <div className="flex items-center p-2 gap-2.5 cursor-pointer transition-colors duration-200 rounded hover:bg-gray-50" onClick={handleSelectAllRoles}>
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.length === roles.length && roles.length > 0}
                                                readOnly
                                            />
                                            <label>Select All</label>
                                        </div>
                                        {roles.map((role) => (
                                            <div
                                                key={role.value}
                                                className="flex items-center p-2 gap-2.5 cursor-pointer transition-colors duration-200 rounded hover:bg-gray-50"
                                                onClick={() => handleRoleToggle(role)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoles.includes(role.value)}
                                                    readOnly
                                                />
                                                <label>{role.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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

                    <div className="flex flex-col gap-2">
                        <label className="text-base font-medium text-gray-700">Remarks:</label>
                        <textarea className="w-full p-3 bg-white border border-gray-300 rounded text-base min-h-[120px] resize-y focus:outline-none focus:border-gray-400 text-gray-700"></textarea>
                    </div>

                    <div className="flex gap-4 justify-end">
                        <button type="submit" className="px-8 py-2.5 rounded text-base cursor-pointer text-white transition-all duration-200 bg-[#1a8d1a] hover:bg-[#158515] focus:ring-2 focus:ring-offset-2 focus:ring-[#1a8d1a]">
                            Send
                        </button>
                    </div>
                </form>
            </div>
            {showToast && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#1a8d1a] text-white px-6 py-3 rounded-lg shadow-lg z-[2000] animate-[slideUp_0.3s_ease-out,fadeOut_0.3s_ease-out_2.7s] text-sm max-w-[80%] text-center">
                    {`${selectedBills.length} bills sent to ${selectedRoles
                        .map(roleValue => roles.find(r => r.value === roleValue)?.label)
                        .join(", ")}`}
                </div>
            )}
        </>
    );
};

export default SendBox;

