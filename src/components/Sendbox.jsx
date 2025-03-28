import React, { useState, useRef, useEffect } from "react";
import "../styles/SendBox.css";
import cross from "../assets/cross.svg";

const SendBox = ({ closeWindow, selectedBills, billsData, singleRole }) => {
    const [isRolesDropdownOpen, setIsRolesDropdownOpen] = useState(false);
    const rolesDropdownRef = useRef(null);
    const [showToast, setShowToast] = useState(false);

    const roles = [
        { value: "Site_Officer", label: "Site Officer" },
        { value: "QS_Team", label: "QS Team" },
        { value: "PIMO_Mumbai_&_MIGO/SES_Team", label: "PIMO Mumbai & MIGO/SES Team" },
        { value: "PIMO_Mumbai_for_Advance_&_FI_Entry", label: "PIMO Mumbai for Advance & FI Entry" },
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
            <div className="form-container">
                <button className="close-button">
                    <img src={cross} onClick={closeWindow} alt="close" />
                </button>

                <form className="send-form" style={{ marginTop: '10px' }} onSubmit={handleSubmit}>
                    {!singleRole && (
                        <div className="form-group">
                            <label>Send to:</label>
                            <div className="custom-dropdown" ref={rolesDropdownRef}>
                                <button
                                    type="button"
                                    className="dropdown-button"
                                    onClick={() => setIsRolesDropdownOpen(!isRolesDropdownOpen)}
                                >
                                    {selectedRoles.length === 0
                                        ? "Select Roles"
                                        : selectedRoles.length === 1
                                            ? roles.find(r => r.value === selectedRoles[0])?.label
                                            : `${selectedRoles.length} Roles Selected`}
                                </button>

                                {isRolesDropdownOpen && (
                                    <div className="dropdown-content">
                                        <div className="dropdown-option" onClick={handleSelectAllRoles}>
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
                                                className="dropdown-option"
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

                    <div className="form-group">
                        <label>Selected Bills:</label>
                        <div className="bills-display">
                            {selectedBillDetails.map((bill, index) => (
                                <div key={index} className="bill-item">
                                    {bill}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Remarks:</label>
                        <textarea className="form-textarea"></textarea>
                    </div>

                    <div className="send-button-group">
                        <button type="submit" className="btn btn-send">
                            Send
                        </button>
                    </div>
                </form>
            </div>
            {showToast && (
                <div className="toast-notification">
                    {`${selectedBills.length} bills sent to ${selectedRoles
                        .map(roleValue => roles.find(r => r.value === roleValue)?.label)
                        .join(", ")}`}
                </div>
            )}
        </>
    );
};

export default SendBox;

