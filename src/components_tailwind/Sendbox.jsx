import React, { useState, useRef, useEffect } from "react";
import cross from "../assets/cross.svg";

const SendBox = ({ closeWindow, selectedBills, billsData, singleRole }) => {
    const [isRolesDropdownOpen, setIsRolesDropdownOpen] = useState(false);
    const rolesDropdownRef = useRef(null);
    const [showToast, setShowToast] = useState(false);

    const roles = [
        { value: "site_office", label: "Site Officer" },
        { value: "qs_site", label: "QS Team" },
        { value: "site_pimo", label: "PIMO Mumbai & MIGO/SES Team" },
        { value: "pimo_mumbai", label: "PIMO Mumbai for Advance & FI Entry" },
        { value: "accounts", label: "Accounts Team" },
        { value: "director", label: "Trustee, Advisor & Director" },
        { value: "admin", label: "Admin" }
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
        return bill ? `Bill ID: ${billId} - ${bill.taxInvNo} (${bill.vendorName})` : billId;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRoles.length === 0) {
            alert("Please select at least one role");
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
            <div className="relative bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto z-50">
                <button 
                    className="absolute top-2 right-2 bg-transparent border-none cursor-pointer p-1"
                    onClick={closeWindow}
                >
                    <img src={cross} alt="close" />
                </button>

                <form className="flex flex-col mt-10" onSubmit={handleSubmit}>
                    {!singleRole && (
                        <div className="flex flex-col mb-4 space-y-2">
                            <label className="text-base font-medium text-black">Send to:</label>
                            <div className="relative w-full" ref={rolesDropdownRef}>
                                <button
                                    type="button"
                                    className="bg-gray-200 rounded text-left w-full py-3 px-3 text-base cursor-pointer outline-none transition-all duration-200 ease-in-out text-gray-700 appearance-none pr-8"
                                    onClick={() => setIsRolesDropdownOpen(!isRolesDropdownOpen)}
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center'
                                    }}
                                >
                                    {selectedRoles.length === 0
                                        ? "Select Roles"
                                        : selectedRoles.length === 1
                                            ? roles.find(r => r.value === selectedRoles[0])?.label
                                            : `${selectedRoles.length} Roles Selected`}
                                </button>

                                {isRolesDropdownOpen && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-300 rounded p-1.5 shadow-lg max-h-60 overflow-y-auto z-50">
                                        <div 
                                            className="flex items-center p-2 gap-2.5 cursor-pointer transition-colors duration-200 rounded hover:bg-gray-100"
                                            onClick={handleSelectAllRoles}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedRoles.length === roles.length && roles.length > 0}
                                                readOnly
                                                className="cursor-pointer"
                                            />
                                            <label className="cursor-pointer">Select All</label>
                                        </div>
                                        {roles.map((role) => (
                                            <div
                                                key={role.value}
                                                className="flex items-center p-2 gap-2.5 cursor-pointer transition-colors duration-200 rounded hover:bg-gray-100"
                                                onClick={() => handleRoleToggle(role)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRoles.includes(role.value)}
                                                    readOnly
                                                    className="cursor-pointer"
                                                />
                                                <label className="cursor-pointer">{role.label}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col mb-4 space-y-2">
                        <label className="text-base font-medium text-black">Selected Bills:</label>
                        <div className="max-h-48 overflow-y-auto bg-gray-200 rounded p-2 scrollbar scrollbar-track-gray-100 scrollbar-thumb-gray-400 scrollbar-thumb-rounded">
                            {selectedBillDetails.map((bill, index) => (
                                <div key={index} className="py-2 px-2 border-b border-gray-300 text-sm last:border-b-0">
                                    {bill}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col mb-4 space-y-2">
                        <label className="text-base font-medium text-black">Remarks:</label>
                        <textarea className="w-full py-3 px-3 border-none bg-gray-200 rounded text-base min-h-32 resize-y"></textarea>
                    </div>

                    <div className="flex justify-end gap-4 bg-white">
                        <button 
                            type="submit" 
                            className="py-2 px-8 border-none rounded text-base cursor-pointer text-white transition-opacity duration-200 bg-green-700 hover:opacity-90"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
            
            {showToast && (
                <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-green-700 text-white py-3 px-6 rounded-lg shadow-md z-50 max-w-4/5 text-center text-sm animate-toast">
                    {`${selectedBills.length} bills sent to ${selectedRoles
                        .map(roleValue => roles.find(r => r.value === roleValue)?.label)
                        .join(", ")}`}
                </div>
            )}
        </>
    );
};

export default SendBox;