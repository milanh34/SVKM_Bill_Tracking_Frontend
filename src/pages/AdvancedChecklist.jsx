import { useEffect, useState } from "react";
import pen from "../assets/pen.svg";
import { bills } from "../apis/bills.api";

const AdvancedChecklist = (props) => {
    const billID = props.billID;

    const [formData, setFormData] = useState({
        sapCode: null,
        vendorName: "",
        natureOfAdvance: "",
        recoverable: "Yes",
        qsCertification: "",
        bgDate: "",
        isContractor: "Yes",
        contractorName: "",
        projectName: "",
        region: "",
        isPORaised: "No",
        poReason: "",
        poNumber: "",
        poDate: "",
        poAmount: "",
        paymentTowards: "",
        panStatus: "",
        compliance: "",
        amountINR: "",
    });

    const [billData, setBillData] = useState({});
    const [isEditable, setIsEditable] = useState(false);

    const toggleEditMode = () => {
        setIsEditable(!isEditable);
    };

    const handleInputChange = (e, field) => {
        setFormData({
            ...formData,
            [field]: e.target.value
        });
    };

    const handleChangesInChecklist = (data) => {
        setFormData((prev) => ({
            ...prev,
            sapCode: data.vendorNo ?? "",
            vendorName: data.vendorName ?? "",
            projectName: data.projectDescription ?? "",
            region: data.region ?? "",
            isPORaised: data.poCreated ?? "No",
            poNumber: data.poNo ?? "",
            poDate: data.poDate ? new Date(data.poDate).toISOString().split("T")[0] : "",
            poAmount: data.poAmt ?? "",
            panStatus: data.panStatus ?? "",
            compliance: data.compliance206AB ?? "",
            amountINR: data.amount ?? "",
        }));
    };

    useEffect(() => {
        fetch(`${bills}/${billID}`)
            .then((res) => res.json())
            .then((data) => {
                setBillData(data);
                handleChangesInChecklist(data);
            });
    }, [billID]);

    return (
        <div className="w-full">
            <div className="w-[98%] max-w-[1200px] mx-auto my-8 p-6 bg-white rounded-lg shadow-sm border border-gray-300">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-xl font-bold text-blue-800">Advanced Checklist</h1>
                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded text-white no-print ${
                            isEditable ? 'bg-green-600 hover:bg-green-700' : 'bg-[#011A99] hover:bg-[#003380]'
                        }`}
                        onClick={toggleEditMode}
                    >
                        {isEditable ? "Save" : "Edit"}
                        <img src={pen} className="bg-transparent" alt="edit icon" />
                    </button>
                </div>

                <div className="w-full h-screen overflow-x-auto overflow-y-scroll mb-8">
                    <table className="w-full border-collapse bg-white table-fixed">
                        <thead>
                            <tr>
                                <th className="w-[100px] border border-black p-4 text-left bg-gray-100 font-semibold text-black">Sr. No.</th>
                                <th className="border border-black p-4 text-left bg-gray-100 font-semibold text-black">Description</th>
                                <th className="border border-black p-4 text-left bg-gray-100 font-semibold text-black">Remarks</th>
                                <th className="border border-black p-4 text-left bg-gray-100 font-semibold text-black">Additional Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black p-4">1</td>
                                <td className="border border-black p-4">SAP Code & Vendor Name</td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        value={formData.vendorName}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'sapCode')}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">2</td>
                                <td className="border border-black p-4">Nature of advance</td>
                                <td className="border border-black p-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">Recoverable mobilisation?</label>
                                            <select
                                                value={formData.recoverable}
                                                disabled={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'recoverable')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            >
                                                <option>Yes</option>
                                                <option>No</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">QS certification attached?</label>
                                            <select
                                                value={formData.qsCertification}
                                                disabled={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'qsCertification')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            >
                                                <option>Yes</option>
                                                <option>No</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">If against BG,date of expiry:</label>
                                            <input
                                                type="date"
                                                value={formData.bgDate}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'bgDate')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">3</td>
                                <td className="border border-black p-4">If advance on behalf of Contractor?</td>
                                <td className="border border-black p-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">Is Contractor?</label>
                                            <select
                                                value={formData.isContractor}
                                                disabled={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'isContractor')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            >
                                                <option>Yes</option>
                                                <option>No</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">Name of Contractor:</label>
                                            <input
                                                type="text"
                                                value={formData.contractorName}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'contractorName')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">4</td>
                                <td className="border border-black p-4">Project Name</td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        value={formData.projectName}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'projectName')}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">5</td>
                                <td className="border border-black p-4">Region</td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        value={formData.region}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'region')}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">6</td>
                                <td className="border border-black p-4">Is PO Raised?</td>
                                <td className="border border-black p-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">Is PO Raised?</label>
                                            <select
                                                value={formData.isPORaised}
                                                disabled={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'isPORaised')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            >
                                                <option>Yes</option>
                                                <option>No</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">Reason why PO not raised?</label>
                                            <input
                                                type="text"
                                                value={formData.poReason}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'poReason')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">7</td>
                                <td className="border border-black p-4">
                                    PO Number
                                    <br />
                                    Date
                                    <br />
                                    Amount
                                </td>
                                <td className="border border-black p-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">PO Number:</label>
                                            <input
                                                type="text"
                                                value={formData.poNumber}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'poNumber')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">PO Date:</label>
                                            <input
                                                type="text"
                                                value={formData.poDate}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'poDate')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm text-gray-600">PO Amount:</label>
                                            <input
                                                type="text"
                                                value={formData.poAmount}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'poAmount')}
                                                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">8</td>
                                <td className="border border-black p-4">Payment is towards</td>
                                <td className="border border-black p-4">
                                    <select
                                        value={formData.paymentTowards}
                                        disabled={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'paymentTowards')}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    >
                                        <option>Select here</option>
                                    </select>
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">9</td>
                                <td className="border border-black p-4">PAN Status</td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        value={formData.panStatus}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'panStatus')}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">10</td>
                                <td className="border border-black p-4">Compliance u/s 206 AB</td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        value={formData.compliance}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'compliance')}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-4">11</td>
                                <td className="border border-black p-4">Amount INR</td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        value={formData.amountINR}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'amountINR')}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                                <td className="border border-black p-4">
                                    <input
                                        type="text"
                                        readOnly={!isEditable}
                                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700 text-sm"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button className="flex items-center gap-2 px-6 py-3 rounded bg-yellow-500 text-gray-800 font-medium no-print hover:bg-yellow-600">
                        Download
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-transparent">
                            <path
                                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 rounded bg-green-600 text-white font-medium no-print hover:bg-green-700">
                        Send to
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="bg-transparent">
                            <path
                                d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default AdvancedChecklist;