import { useState } from 'react';
import Header from '../components/Header';
import pen from "../assets/pen.svg";

const ChecklistDirectFI = () => {
    const [formData, setFormData] = useState({
        sapCode: '',
        vendorName: '',
        purpose: '',
        amount: '',
        wbsNo: '',
        networkActivityNo: '',
        costElement: '',
        isBudgetAvailable: '',
        approvedByProject: '',
        submittedBy: '',
        isInvoiceAttached: '',
        expensesRecovered: '',
        compliances1: '',
        compliances2: '',
        isGstCharged: '',
        isRcmApplicable: '',
        approvedByAccounts: '',
        documentNo: '',
        postingDate: ''
    });

    const [isEditable, setIsEditable] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const toggleEditMode = () => {
        setIsEditable(!isEditable);
    };

    const handleRadioChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add submission logic here
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-grow p-4">
                <div className="bg-white rounded shadow p-6 max-w-6xl mx-auto">
                    <div className="checklist-header">
                        <h1 className="text-xl font-bold text-blue-800 mb-6">Direct FI Checklist</h1>
                        <button
                            className="edit-button no-print"
                            onClick={toggleEditMode}
                            style={{ backgroundColor: isEditable ? "green" : "#011A99", color: "white" }}
                        >
                            {isEditable ? "Save" : "Edit"}
                            <img src={pen} style={{ background: 'transparent' }} alt="edit icon" />
                        </button>

                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border border-gray-300 p-2 bg-gray-100 w-12">Sr. No.</th>
                                        <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">Description</th>
                                        <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">Remarks</th>
                                        <th className="border border-gray-300 p-2 bg-gray-100 w-1/4">Additional Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Project Dept Section */}
                                    <tr>
                                        <td colSpan="4" className="border border-gray-300 p-2 bg-gray-100 font-bold">
                                            To be filled in by Project Dept:
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">1</td>
                                        <td className="border border-gray-300 p-2">SAP Code & Vendor Name</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Column 6"
                                                    className="border border-gray-300 p-1 w-1/2"
                                                    value={formData.sapCode}
                                                    onChange={(e) => handleInputChange('sapCode', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Column 7"
                                                    className="border border-gray-300 p-1 w-1/2"
                                                    value={formData.vendorName}
                                                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">2</td>
                                        <td className="border border-gray-300 p-2">Purpose of expenses</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.purpose}
                                                onChange={(e) => handleInputChange('purpose', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">3</td>
                                        <td className="border border-gray-300 p-2">Amount</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="number"
                                                placeholder="Column 23"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.amount}
                                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">4</td>
                                        <td className="border border-gray-300 p-2">WBS No.</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.wbsNo}
                                                onChange={(e) => handleInputChange('wbsNo', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">5</td>
                                        <td className="border border-gray-300 p-2">Network & Activity No</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.networkActivityNo}
                                                onChange={(e) => handleInputChange('networkActivityNo', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">6</td>
                                        <td className="border border-gray-300 p-2">Cost Element</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.costElement}
                                                onChange={(e) => handleInputChange('costElement', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">7</td>
                                        <td className="border border-gray-300 p-2">Is Budget available</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="budget"
                                                        value="Yes"
                                                        checked={formData.isBudgetAvailable === 'Yes'}
                                                        onChange={() => handleRadioChange('isBudgetAvailable', 'Yes')}
                                                        className="mr-1"
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="budget"
                                                        value="No"
                                                        checked={formData.isBudgetAvailable === 'No'}
                                                        onChange={() => handleRadioChange('isBudgetAvailable', 'No')}
                                                        className="mr-1"
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">8</td>
                                        <td className="border border-gray-300 p-2">Approved by</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.approvedByProject}
                                                onChange={(e) => handleInputChange('approvedByProject', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">9</td>
                                        <td className="border border-gray-300 p-2">Submitted by</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.submittedBy}
                                                onChange={(e) => handleInputChange('submittedBy', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">10</td>
                                        <td className="border border-gray-300 p-2">Original invoice/intimation/etc attached</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="invoice"
                                                        value="Yes"
                                                        checked={formData.isInvoiceAttached === 'Yes'}
                                                        onChange={() => handleRadioChange('isInvoiceAttached', 'Yes')}
                                                        className="mr-1"
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="invoice"
                                                        value="No"
                                                        checked={formData.isInvoiceAttached === 'No'}
                                                        onChange={() => handleRadioChange('isInvoiceAttached', 'No')}
                                                        className="mr-1"
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">11</td>
                                        <td className="border border-gray-300 p-2">Whether exp of SVKM to be recovered from contractor</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                placeholder="Expenses of SVKM/to be recovered from contractor"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.expensesRecovered}
                                                onChange={(e) => handleInputChange('expensesRecovered', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">12</td>
                                        <td className="border border-gray-300 p-2">Compliances</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                placeholder="Column 9"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.compliances1}
                                                onChange={(e) => handleInputChange('compliances1', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                placeholder="Column 10"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.compliances2}
                                                onChange={(e) => handleInputChange('compliances2', e.target.value)}
                                            />
                                        </td>
                                    </tr>

                                    {/* Accounts Dept Section */}
                                    <tr>
                                        <td colSpan="4" className="border border-gray-300 p-2 bg-gray-100 font-bold">
                                            To be filled in by Accounts Dept:
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">13</td>
                                        <td className="border border-gray-300 p-2">Is GST charged in invoice</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="gst"
                                                        value="Yes"
                                                        checked={formData.isGstCharged === 'Yes'}
                                                        onChange={() => handleRadioChange('isGstCharged', 'Yes')}
                                                        className="mr-1"
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="gst"
                                                        value="No"
                                                        checked={formData.isGstCharged === 'No'}
                                                        onChange={() => handleRadioChange('isGstCharged', 'No')}
                                                        className="mr-1"
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">14</td>
                                        <td className="border border-gray-300 p-2">Is RCM applicable</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="rcm"
                                                        value="Yes"
                                                        checked={formData.isRcmApplicable === 'Yes'}
                                                        onChange={() => handleRadioChange('isRcmApplicable', 'Yes')}
                                                        className="mr-1"
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="rcm"
                                                        value="No"
                                                        checked={formData.isRcmApplicable === 'No'}
                                                        onChange={() => handleRadioChange('isRcmApplicable', 'No')}
                                                        className="mr-1"
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">15</td>
                                        <td className="border border-gray-300 p-2">Approved by</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.approvedByAccounts}
                                                onChange={(e) => handleInputChange('approvedByAccounts', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">16</td>
                                        <td className="border border-gray-300 p-2">Document no in SAP</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.documentNo}
                                                onChange={(e) => handleInputChange('documentNo', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-300 p-2">17</td>
                                        <td className="border border-gray-300 p-2">Posting date in SAP</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.postingDate}
                                                onChange={(e) => handleInputChange('postingDate', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                className="bg-yellow-500 text-white px-4 py-2 rounded"
                            >
                                Continue ≫
                            </button>
                            <button
                                type="submit"
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Submit ≫
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ChecklistDirectFI;