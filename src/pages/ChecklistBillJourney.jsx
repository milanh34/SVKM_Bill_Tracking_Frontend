import React from "react";
import Header from '../components/Header';

const ChecklistBillJourney = () => {
    const rows = [
        "Bill Received at Site",
        "Receipt By Project Team",
        "Received for PO",
        "Receipt of PO",
        "Bill send for Quality Certification",
        "Bill send to QS",
        "Certified by QS",
        "Certified by Arch/PMC/SVKM",
        "Bill send to Site Engineer/ Site Incharge",
        "Receipt By Site Project Director",
        "Receipt at MPTP",
        "Certified by LPC Members",
        "MIGO Date / MIGO No.",
        "Bill Send to PIMO Mumbai",
        "Bill Received at PIMO Mumbai",
        "Bill Send to QS Certification",
        "Received from QS With COP",
        "Given to I.T. Dept.",
        "Received Back from I.T.Dept.",
        "SES Date / SES No.",
        "Certified by Project DIRECTOR",
        "Certified by Project ADVISOR",
        "Certified by MC Members",
        "Submitted to Accounts Department"
    ];

    return (
        <>
            <Header />
            <div className="overflow-x-auto p-6 bg-gray-50 min-h-screen">

                <h1 className="text-2xl font-semibold mb-4 text-left text-blue-800">Bill Journey Checklist</h1>
                <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-xl">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700 text-sm">
                            <th className="px-4 py-2 text-left w-2/5 border-r">Description</th>
                            <th className="px-4 py-2 text-left w-1/3 border-r">Name</th>
                            <th className="px-4 py-2 text-left">Signature</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((description, index) => (
                            <tr
                                key={index}
                                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                            >
                                <td className="px-4 py-2 border-t border-r border-gray-300">
                                    {description}
                                </td>
                                <td className="px-4 py-2 border-t border-r border-gray-300"></td>
                                <td className="px-4 py-2 border-t border-gray-300"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ChecklistBillJourney;
