import React, { useEffect, useState } from 'react';
import "../styles/ReportsBasic.css";
import { useLocation, useNavigate } from 'react-router-dom';

const ReportBtns = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentRoute = location.pathname.split('/')[1]; // Get the part of the path after "/"
    const [selectedRole, setSelectedRole] = useState("");
    const [buttonClicked, setButtonClicked] = useState("");

    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) {
            setSelectedRole(storedRole);
        }
    }, []);

    const handleClick = (e) => {
        e.preventDefault();

        let clickedId = e.target.id;
        
        setButtonClicked(clickedId);
        console.log("buttonClicked = " + buttonClicked);
        
        navigate(`/${clickedId}`);
        
    };

    // Define role-based access
    const roleAccess = {
        "Site_Officer": ["reportsrecatsite", "reportscouriermumbai"],
        "QS_Team": [],
        "PIMO_Mumbai_&_MIGO/SES_Team": ["reportscouriermumbai", "reportsreceivedmumbai", "reportsinvoiceacctdept", "reportspending"],
        "PIMO_Mumbai_for_Advance_&_FI_Entry": ["reportsrecatsite"],
        "Accounts_Team": ["reportsbilloutstanding", "reportsbilloutstandingsubtotal", "reportsinvoiceacctdept", "reportsinvoiceqssite", "reportsinvoicepaid", "reportsbilljourney"],
        "Trustee,_Advisor_&_Director": ["reportsrecatsite", "reportsbilloutstanding", "reportsbilloutstandingsubtotal", "reportscouriermumbai", "reportsreceivedmumbai", "reportsinvoiceacctdept", "reportsinvoiceqssite", "reportsinvoicepaid", "reportspending", "reportsbilljourney"],
        "Admin": ["reportsrecatsite", "reportsbilloutstanding", "reportsbilloutstandingsubtotal", "reportscouriermumbai", "reportsreceivedmumbai", "reportsinvoiceacctdept", "reportsinvoiceqssite", "reportsinvoicepaid", "reportspending", "reportsbilljourney"]
    };

    const allButtons = [
        { id: 'reportsrecatsite', label: 'Invoices Received at Site' },
        { id: 'reportsbilloutstanding', label: 'Outstanding Bill Report' },
        { id: 'reportsbilloutstandingsubtotal', label: 'Outstanding Bill Report Subtotal' },
        { id: 'reportscouriermumbai', label: 'Invoices Couriered to Mumbai' },
        { id: 'reportsreceivedmumbai', label: 'Invoices Received at Mumbai' },
        { id: 'reportsinvoiceacctdept', label: 'Invoices given to Accounts dept' },
        { id: 'reportsinvoiceqssite', label: 'Invoices given to QS site' },
        { id: 'reportsinvoicepaid', label: 'Invoices Paid' },
        { id: 'reportspending', label: 'Reports of pending bills with PIMO/SVKM site office/QS Mumbai office/QS site office' },
        { id: 'reportsbilljourney', label: 'Bill Journey' }
    ];

    // Get allowed buttons for the user role
    const allowedButtons = roleAccess[selectedRole] ? allButtons.filter(btn => roleAccess[selectedRole].includes(btn.id)) : [];

    return (
        <div className='report-btn-main'>
            {allowedButtons.map(btn => (
                <button
                    key={btn.id}
                    onClick={handleClick}
                    id={btn.id}
                    className='report-btns'
                    style={{
                        backgroundColor: currentRoute === btn.id ? '#ffffff' : '#364CBB',
                        color: currentRoute === btn.id ? "#000" : "fff",
                        border: currentRoute === btn.id ? "3px solid #364CBB" : "none"
                    }}
                >
                    {btn.label}
                </button>
            ))}
        </div>
    );
};

export default ReportBtns;
