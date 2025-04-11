import { useState } from 'react';
import Header from '../components_tailwind/Header';
import pen from "../assets/pen.svg";

const ChecklistAccount = () => {
    const [formData, setFormData] = useState({
        taxInvoiceAttached: '',
        projectInchargeApproval: '',
        projectLocation: '',
        trusteeApproval: '',
        invoiceAmount: '',
        tdsCement: '',
        gstCharged: '',
        deliveryChallan: '',
        deliveryChallanStamp: '',
        ewayBill: '',
        loadingUnloadingAmount: '',
        purchaseOrderAttached: '',
        vendorGst: '',
        gstStatus: '',
        gleedsCertificationAmount: '',
        retentionAmount: '',
        billHoldAmount: '',
        earlierBillHoldReleaseAmount: '',
        measurementSheet: '',
        others: '',
        advanceVendorAccount: '',
        advanceAdjustThisInvoice: '',
        netPayable: '',
        projectCampus: ''
    });

    const [isEditable, setIsEditable] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleRadioChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const toggleEditMode = () => {
        setIsEditable(!isEditable);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add submission logic here
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">

            <Header />

            {/* Main Content */}
            <main className="flex-grow p-4">
                <div className="bg-white rounded shadow p-6 max-w-6xl mx-auto">
                    <div className="checklist-header">
                        <h1 className="text-xl font-bold text-blue-800 mb-6">Account Checklist</h1>
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
                                        <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">Description</th>
                                        <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">Remarks</th>
                                        <th className="border border-gray-300 p-2 bg-gray-100 w-1/3">Additional remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Row 1 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">Vendor Original Tax Invoice attached</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="taxInvoice"
                                                        value="Yes"
                                                        checked={formData.taxInvoiceAttached === 'Yes'}
                                                        onChange={() => handleRadioChange('taxInvoiceAttached', 'Yes')}
                                                        className="mr-1"
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="taxInvoice"
                                                        value="No"
                                                        checked={formData.taxInvoiceAttached === 'No'}
                                                        onChange={() => handleRadioChange('taxInvoiceAttached', 'No')}
                                                        className="mr-1"
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-1">
                                                <span>SAP doc no.</span>
                                                <input
                                                    type="text"
                                                    className="border border-gray-300 p-1 w-full"
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 2 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">Invoice Approved By Project Incharge</td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-2">
                                                <select
                                                    className="border border-gray-300 p-1 w-full"
                                                    value={formData.projectInchargeApproval}
                                                    onChange={(e) => handleInputChange('projectInchargeApproval', e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="VP">VP</option>
                                                    <option value="JKB">JKB</option>
                                                    <option value="RB">RB</option>
                                                    <option value="DG">DG</option>
                                                    <option value="PP">PP</option>
                                                </select>

                                                <select
                                                    className="border border-gray-300 p-1 w-full"
                                                    value={formData.projectLocation}
                                                    onChange={(e) => handleInputChange('projectLocation', e.target.value)}
                                                >
                                                    <option value="">Select Location</option>
                                                    <option value="Shirpur">Shirpur</option>
                                                    <option value="Dhule">Dhule</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center">
                                                    <span className="mr-2">Same bill no.in vendor ledger:</span>
                                                    <label className="flex items-center mr-2">
                                                        <input type="radio" name="sameBillNo" value="Yes" className="mr-1" />
                                                        Yes
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="sameBillNo" value="No" className="mr-1" />
                                                        No
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <span className="mr-2">Migo Entry done:</span>
                                                    <label className="flex items-center mr-2">
                                                        <input type="radio" name="migoEntry" value="Yes" className="mr-1" />
                                                        Yes
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="migoEntry" value="No" className="mr-1" />
                                                        No
                                                    </label>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 3 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">Invoice Approved By Trustee</td>
                                        <td className="border border-gray-300 p-2">
                                            <select
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.trusteeApproval}
                                                onChange={(e) => handleInputChange('trusteeApproval', e.target.value)}
                                            >
                                                <option value="">Select</option>
                                                <option value="HS">HS</option>
                                                <option value="HC">HC</option>
                                                <option value="JP">JP</option>
                                                <option value="JK">JK</option>
                                                <option value="BP">BP</option>
                                                <option value="RB">RB</option>
                                                <option value="Member-LMC">Member-LMC</option>
                                            </select>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center">
                                                    <span className="mr-2">IS PO no mentioned on Bill?</span>
                                                    <label className="flex items-center mr-2">
                                                        <input type="radio" name="poMentioned" value="Yes" className="mr-1" />
                                                        Yes
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="poMentioned" value="No" className="mr-1" />
                                                        No
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <span className="mr-2">IS PO no mentioned is correct?</span>
                                                    <label className="flex items-center mr-2">
                                                        <input type="radio" name="poCorrect" value="Yes" className="mr-1" />
                                                        Yes
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="poCorrect" value="No" className="mr-1" />
                                                        No
                                                    </label>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 4 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">Invoice Amount</td>
                                        <td className="border border-gray-300 p-2">
                                            <input
                                                type="text"
                                                placeholder="Column 22 -Column 23"
                                                className="border border-gray-300 p-1 w-full"
                                                value={formData.invoiceAmount}
                                                onChange={(e) => handleInputChange('invoiceAmount', e.target.value)}
                                            />
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-1">
                                                <span>Bill for Material / services / material + services</span>
                                                <select className="border border-gray-300 p-1 w-full">
                                                    <option value="">Select</option>
                                                    <option value="Material">Material</option>
                                                    <option value="Services">Services</option>
                                                    <option value="Material_Services">Material + Services</option>
                                                </select>
                                                <div className="mt-1">
                                                    <span>Total Material Purchases -&lt;50lacs/&gt;50 lacs</span>
                                                    <select className="border border-gray-300 p-1 w-full mt-1">
                                                        <option value="">&lt;50lacs</option>
                                                        <option value="gt50lacs">&gt;50lacs</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 5 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">
                                            TDS u/s 194C / 194J/194I or 194Q + TDS deducted-cement/steel,etc
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div>
                                                <select className="border border-gray-300 p-1 w-full">
                                                    <option value="">Select TDS Section</option>
                                                    <option value="194C">194C</option>
                                                    <option value="194J">194J</option>
                                                    <option value="194I">194I</option>
                                                    <option value="194Q">194Q</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2"></td>
                                    </tr>

                                    {/* Row 6 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">
                                            TDS deducted on cement/steel,etc.
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex items-center">
                                                <span className="mr-2">Rs.</span>
                                                <input
                                                    type="number"
                                                    className="border border-gray-300 p-1 w-full"
                                                    value={formData.tdsCement || ''}
                                                    onChange={(e) => handleInputChange('tdsCement', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex items-center">
                                                <span className="mr-2">Net amount : Rs.</span>
                                                <input
                                                    type="number"
                                                    className="border border-gray-300 p-1 w-full"
                                                />
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 7 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">
                                            Is GST charged in bill
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-4">
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="gstCharged"
                                                            value="Yes"
                                                            checked={formData.gstCharged === 'Yes'}
                                                            onChange={() => handleRadioChange('gstCharged', 'Yes')}
                                                            className="mr-1"
                                                        />
                                                        Yes
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="gstCharged"
                                                            value="No"
                                                            checked={formData.gstCharged === 'No'}
                                                            onChange={() => handleRadioChange('gstCharged', 'No')}
                                                            className="mr-1"
                                                        />
                                                        No
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="gstCharged"
                                                            value="RCM"
                                                            checked={formData.gstCharged === 'RCM'}
                                                            onChange={() => handleRadioChange('gstCharged', 'RCM')}
                                                            className="mr-1"
                                                        />
                                                        RCM
                                                    </label>
                                                </div>
                                                <div className="text-sm">(Consult Mr Mekap)</div>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center">
                                                    <span className="mr-2">SVKM GST no mentioned on bill ?</span>
                                                    <label className="flex items-center mr-2">
                                                        <input type="radio" name="svkmGst" value="Yes" className="mr-1" />
                                                        Yes
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="svkmGst" value="No" className="mr-1" />
                                                        No
                                                    </label>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 8 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">
                                            Vendor Original Delivery Challan
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="deliveryChallan"
                                                        value="Yes-with stamp"
                                                        checked={formData.deliveryChallan === 'Yes-with stamp'}
                                                        onChange={() => handleRadioChange('deliveryChallan', 'Yes-with stamp')}
                                                        className="mr-1"
                                                    />
                                                    Yes- with stamp
                                                </label>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center">
                                                    <label className="flex items-center mr-4">
                                                        <input
                                                            type="radio"
                                                            name="deliveryChallanStamp"
                                                            value="Yes- w/o stamp"
                                                            checked={formData.deliveryChallanStamp === 'Yes- w/o stamp'}
                                                            onChange={() => handleRadioChange('deliveryChallanStamp', 'Yes- w/o stamp')}
                                                            className="mr-1"
                                                        />
                                                        Yes- w/o stamp
                                                    </label>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="flex items-center">
                                                        <input type="radio" name="stampBill" value="No-with stamp on bill" className="mr-1" />
                                                        No- with stamp on bill
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="stampBill" value="No-Services" className="mr-1" />
                                                        No-Services
                                                    </label>
                                                    <label className="flex items-center">
                                                        <input type="radio" name="stampBill" value="No-w/o stamp on bill" className="mr-1" />
                                                        No- w/o stamp on bill
                                                    </label>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Row 9 */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">
                                            E-Way bill attached
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-1">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ewayBill"
                                                        value="Yes - Part A avbl & Part B avbl"
                                                        checked={formData.ewayBill === 'Yes - Part A avbl & Part B avbl'}
                                                        onChange={() => handleRadioChange('ewayBill', 'Yes - Part A avbl & Part B avbl')}
                                                        className="mr-1"
                                                    />
                                                    Yes - Part A avbl & Part B avbl
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ewayBill"
                                                        value="Yes - bill to ship to E-Way bill avbl"
                                                        checked={formData.ewayBill === 'Yes - bill to ship to E-Way bill avbl'}
                                                        onChange={() => handleRadioChange('ewayBill', 'Yes - bill to ship to E-Way bill avbl')}
                                                        className="mr-1"
                                                    />
                                                    Yes - bill to ship to E-Way bill avbl
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="ewayBill"
                                                        value="Yes - Works Contract E-way bill avbl"
                                                        checked={formData.ewayBill === 'Yes - Works Contract E-way bill avbl'}
                                                        onChange={() => handleRadioChange('ewayBill', 'Yes - Works Contract E-way bill avbl')}
                                                        className="mr-1"
                                                    />
                                                    Yes - Works Contract E-way bill avbl
                                                </label>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex flex-col gap-1">
                                                <label className="flex items-center">
                                                    <input type="radio" name="ewayStatus" value="No - distance < 50 kms" className="mr-1" />
                                                    No - distance &lt; 50 kms
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="ewayStatus" value="No- Mat counered" className="mr-1" />
                                                    No- Mat counered
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="ewayStatus" value="No- inter state, amt < 50,000" className="mr-1" />
                                                    No- inter state, amt &lt; 50,000
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="ewayStatus" value="No-Mat hand delivery" className="mr-1" />
                                                    No-Mat hand delivery
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="ewayStatus" value="No- intra state, amt < 1,00,000" className="mr-1" />
                                                    No- intra state, amt &lt; 1,00,000
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="ewayStatus" value="No-Services" className="mr-1" />
                                                    No-Services
                                                </label>
                                                <div className="mt-2">
                                                    <span>G L Account: 480</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div>
                                                        <span>Network:</span>
                                                        <input type="text" className="border border-gray-300 p-1 w-full mt-1" />
                                                    </div>
                                                    <div>
                                                        <span>Activity:</span>
                                                        <input type="text" className="border border-gray-300 p-1 w-full mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Continue with the rest of the rows... */}
                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">
                                            Loading/Unloading/Debris/Debit Note - by SVKM or Vendor
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex items-center">
                                                <span className="mr-2">Rs.</span>
                                                <input
                                                    type="number"
                                                    className="border border-gray-300 p-1 w-full"
                                                    value={formData.loadingUnloadingAmount || ''}
                                                    onChange={(e) => handleInputChange('loadingUnloadingAmount', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2"></td>
                                    </tr>

                                    <tr>
                                        <td className="border border-gray-300 p-2 font-medium">
                                            Purchase Order Copy attached
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="purchaseOrder"
                                                        value="Yes"
                                                        checked={formData.purchaseOrderAttached === 'Yes'}
                                                        onChange={() => handleRadioChange('purchaseOrderAttached', 'Yes')}
                                                        className="mr-1"
                                                    />
                                                    Yes
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="purchaseOrder"
                                                        value="No"
                                                        checked={formData.purchaseOrderAttached === 'No'}
                                                        onChange={() => handleRadioChange('purchaseOrderAttached', 'No')}
                                                        className="mr-1"
                                                    />
                                                    No
                                                </label>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <div className="flex items-center">
                                                <span className="mr-2">Is PO signed by authorised?</span>
                                                <label className="flex items-center mr-2">
                                                    <input type="radio" name="poSigned" value="Yes" className="mr-1" />
                                                    Yes
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="poSigned" value="No" className="mr-1" />
                                                    No
                                                </label>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Add the rest of the rows following the same pattern */}

                                </tbody>
                            </table>
                        </div>

                        <div className="checklist-footer">
                            <button className="download-button no-print" style={{ color: 'white' }}>
                                Download
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ background: 'transparent' }} >
                                    <path
                                        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3"
                                        stroke="#fff"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <button className="send-button no-print">
                                Send to
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ background: 'transparent' }}>
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
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ChecklistAccount;