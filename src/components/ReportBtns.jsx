import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const ReportBtns = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentRoute = location.pathname.split('/')[1]; // Get the part of the path after "/"
    const [selectedRole, setSelectedRole] = useState("");
    const [buttonClicked, setButtonClicked] = useState("");

    useEffect(() => {
        const storedRole = Cookies.get("userRole");
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
    // const roleAccess = {
    //     "site_officer": ["invAtSite", "reportscouriermumbai"],
    //     "qs_site": [],
    //     "site_pimo": ["invAtSite", "reportscouriermumbai", "reportsreceivedmumbai", "reportsinvoiceacctdept", "invAtPIMO"],
    //     // "pimo_mumbai": ["invAtSite"],
    //     "accounts": ["reportsbilloutstanding", "reportsbilloutstandingsubtotal", "reportsinvoiceacctdept", "reportsinvoicepaid", "reportsbilljourney"],
    //     "director": ["invAtSite", "reportsbilloutstanding", "reportsbilloutstandingsubtotal", "reportscouriermumbai", "reportsreceivedmumbai", "reportsinvoiceacctdept", "reportsinvoiceqssite", "reportsinvoicepaid", "invAtPIMO", "reportsbilljourney"],
    //     "admin": ["invAtSite", "reportsbilloutstanding", "reportsbilloutstandingsubtotal", "reportscouriermumbai", "reportsreceivedmumbai", "reportsinvoiceacctdept", "reportsinvoiceqssite", "reportsinvoicepaid", "invAtPIMO", "reportsbilljourney"]
    // };
    const roleAccess = {
        "site_officer": ["vendordetails", "invatsite", "invqsmeasurement", "invqsprovcop", "invsentpimo"],
        "qs_site": ["vendordetails", "invqsmeasurement", "invqsprovcop", "invqsmumbaicop", "invreturnqsmeasurement", "invreturnqsprovcop", "invreturnqsmumbaicop"],
        "site_pimo": ["vendordetails", "invatsite", "invatpimo", "invqsmeasurement", "invqsprovcop", "invqsmumbaicop", "invsentpimo", "invsentaccts", "billkidhar", "billjourney"],
        "accounts": ["vendordetails", "reportsbilloutstanding", "reportsbilloutstandingsubtotal", "invpaid", "billkidhar", "billjourney"],
        "director": ["vendordetails", "invatsite", "invatpimo", "reportsbilloutstanding", "reportsbilloutstandingsubtotal", "invpaid", "billkidhar", "billjourney"],
        "admin": ["vendordetails", "invatsite", "invatpimo", "reportsbilloutstanding", "reportsbilloutstandingsubtotal", "invqsmeasurement", "invqsprovcop", "invqsmumbaicop", "invsentpimo", "invreturnqsmeasurement", "invreturnqsprovcop", "invreturnqsmumbaicop", "invsentaccts", "invpaid", "billkidhar", "billjourney"]
    };


    const allButtons = [
        { id: 'invatsite', label: 'Invoices at Site' },
        { id: 'invatpimo', label: 'Invoices at PIMO' },

        { id: 'reportsbilloutstanding', label: 'Outstanding Bill Report' },
        { id: 'reportsbilloutstandingsubtotal', label: 'Outstanding Bill Report Subtotal' },

        { id: 'invqsmeasurement', label: 'Invoices With QS site for Measurement' },
        { id: 'invqsprovcop', label: 'Invoices With QS site for Prov COP' },
        { id: 'invqsmumbaicop', label: 'Invoices With QS Mumbai for COP' },

        { id: 'invsentpimo', label: 'Invoices Sent to PIMO Mumbai' },

        { id: 'invreturnqsmeasurement', label: 'Invoices returned by QS site after Measurement' },
        { id: 'invreturnqsprovcop', label: 'Invoices returned by QS site after Prov COP' },
        { id: 'invreturnqsmumbaicop', label: 'Invoices returned by QS Mumbai after COP' },

        { id: 'invsentaccts', label: 'Invoices sent to Accounts Team' },

        { id: 'invpaid', label: 'Invoices Paid' },

        { id: 'billkidhar', label: 'Bill Kidhar' },
        { id: 'billjourney', label: 'Bill Journey' },
        // Available to every team, per observation N-08.
        { id: 'vendordetails', label: 'Vendor Details' },
        // Forms repository - every team downloads, Admin uploads (29.09, reply Q2).
        { id: 'forms', label: 'Forms' }
    ];

    // Open to every signed-in role, whatever its per-role list above says.
    const everyRole = ['forms'];

    // Get allowed buttons for the user role
    const allowedButtons = allButtons.filter(btn =>
        (selectedRole && everyRole.includes(btn.id)) || roleAccess[selectedRole]?.includes(btn.id)
    );

    return (
        <div className='flex flex-wrap justify-start items-center gap-[1vw] mb-[1vh] px-[2vw] max-w-full'>
            {allowedButtons.map(btn => (
                <button
                    key={btn.id}
                    onClick={handleClick}
                    id={btn.id}
                    className='bg-[#364cbb] text-white font-semibold px-[1.4vw] py-[0.5vw] rounded-[1vw] border-none cursor-pointer whitespace-nowrap text-[0.9vw] transition-all duration-200 hover:bg-[#2a3c9e] hover:-translate-y-0.5 shadow-md'
                    style={{
                        backgroundColor: currentRoute === btn.id ? '#ffffff' : '#364CBB',
                        color: currentRoute === btn.id ? "#000" : "#fff",
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
