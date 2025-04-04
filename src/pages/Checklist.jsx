import { useEffect, useState } from "react";
import "../styles/AdvancedChecklist.css";
import Header from "../components/Header";
import pen from "../assets/pen.svg";
import { useLocation } from "react-router-dom";
import { bills } from "../apis/bills.api";

const Checklist = () => {

    const location = useLocation();

    const billID = location.state?.item || "hello";

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

    console.log(billData);

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
                // console.log(data);
                setBillData(data);
                handleChangesInChecklist(data);
            })

    }, []);

    return (
        <div style={{ width: '100%' }}>
            <Header />
            <h1>{billID}</h1>
            <div className="checklist-container">
                <div className="checklist-header">
                    <h1>Checklist</h1>
                    <button
                        className="edit-button"
                        onClick={toggleEditMode}
                        style={{ backgroundColor: isEditable ? "green" : "#011A99", color: "white" }}
                    >
                        {isEditable ? "Save" : "Edit"}
                        <img src={pen} style={{ background: 'transparent' }} alt="edit icon" />
                    </button>

                </div>

                <div className="checklist-table-wrapper" >
                    <table className="checklist-table">
                        <thead>
                            <tr>
                                <th style={{ width: '100px' }}>Sr. No.</th>
                                <th >Description</th>
                                <th >Remarks</th>
                                <th>Additional Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>SAP Code & Vendor Name</td>
                                <td>
                                    <input
                                        type="text"
                                        value={formData.vendorName}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'sapCode')}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="additional-remarks"
                                        readOnly={!isEditable}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Nature of advance</td>
                                <td>
                                    <div className="stacked-inputs">
                                        <div className="input-group">
                                            <label>Recoverable mobilisation?</label>
                                            <select
                                                value={formData.recoverable}
                                                disabled={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'recoverable')}
                                            >
                                                <option>Yes</option>
                                                <option>No</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>QS certification attached?</label>
                                            <select
                                                value={formData.qsCertification}
                                                disabled={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'qsCertification')}
                                            >
                                                <option>Yes</option>
                                                <option>No</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>If against BG,date of expiry:</label>
                                            <input
                                                type="date"
                                                value={formData.bgDate}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'bgDate')}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>If advance on behalf of Contractor?</td>
                                <td>
                                    <div className="stacked-inputs">
                                        <select
                                            value={formData.isContractor}
                                            disabled={!isEditable}
                                            onChange={(e) => handleInputChange(e, 'isContractor')}
                                        >
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                        <div className="input-group">
                                            <label>Name of Contractor:</label>
                                            <input
                                                type="text"
                                                value={formData.contractorName}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'contractorName')}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Project Name</td>
                                <td>
                                    <input
                                        type="text"
                                        value={formData.projectName}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'projectName')}
                                    />
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Region</td>
                                <td>
                                    <input
                                        type="text"
                                        value={formData.region}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'region')}
                                    />
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>Is PO Raised?</td>
                                <td>
                                    <div className="stacked-inputs">
                                        <select
                                            value={formData.isPORaised}
                                            disabled={!isEditable}
                                            onChange={(e) => handleInputChange(e, 'isPORaised')}
                                        >
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                        <div className="input-group">
                                            <label>Reason why PO not raised?</label>
                                            <input
                                                type="text"
                                                value={formData.poReason}
                                                readOnly={!isEditable}
                                                onChange={(e) => handleInputChange(e, 'poReason')}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>7</td>
                                <td>
                                    PO Number
                                    <br />
                                    Date
                                    <br />
                                    Amount
                                </td>
                                <td>
                                    <div className="stacked-inputs">
                                        <input
                                            type="text"
                                            value={formData.poNumber}
                                            readOnly={!isEditable}
                                            onChange={(e) => handleInputChange(e, 'poNumber')}
                                        />
                                        <input
                                            type="text"
                                            value={formData.poDate}
                                            readOnly={!isEditable}
                                            onChange={(e) => handleInputChange(e, 'poDate')}
                                        />
                                        <input
                                            type="text"
                                            value={formData.poAmount}
                                            readOnly={!isEditable}
                                            onChange={(e) => handleInputChange(e, 'poAmount')}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>8</td>
                                <td>Payment is towards</td>
                                <td>
                                    <select
                                        value={formData.paymentTowards}
                                        disabled={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'paymentTowards')}
                                    >
                                        <option>Material</option>
                                        <option>Services</option>
                                        <option>Other</option>
                                    </select>
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>9</td>
                                <td>PAN Status</td>
                                <td>
                                    <input
                                        type="text"
                                        value={formData.panStatus}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'panStatus')}
                                    />
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>10</td>
                                <td>Compliance u/s 206 AB</td>
                                <td>
                                    <input
                                        type="text"
                                        value={formData.compliance}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'compliance')}
                                    />
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                            <tr>
                                <td>11</td>
                                <td>Amount INR</td>
                                <td>
                                    <input
                                        type="text"
                                        value={formData.amountINR}
                                        readOnly={!isEditable}
                                        onChange={(e) => handleInputChange(e, 'amountINR')}
                                    />
                                </td>
                                <td>
                                    <input type="text" className="additional-remarks" readOnly={!isEditable} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="checklist-footer">
                    <button className="download-button" style={{ color: 'white' }}>
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
                    <button className="send-button">
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
            </div>
        </div>
    );
};

export default Checklist;