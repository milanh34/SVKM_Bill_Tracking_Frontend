import { useState } from 'react';
import '../styles/VendorDetails.css';

// Vendor Name
// Vendor ID
// Vendor Description
// TAN
// PAN
// 206 Compliance 
// PAN Status
// Vendor Email ID 

const VendorDetails = () => {

    const [vendorFormData, setVendorFormData] = useState({
        vendorname: "",
        vendorid: "",
        vendordesc: "",
        vendorTAN: "",
        vendorPAN: "",
        vendor206comp: "No",
        vendorPANstatus: "Inactive",
        vendoremailID: ""
    })


    const handleChange = (e) => {
        e.preventDefault();


        let className = e.target.className;
        let value = e.target.value;
        setVendorFormData({
            ...vendorFormData, [className]: value,
        })
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Vendor Form Submit Clicked");
        alert("Alert Vendor Form Submit Clicked");
    }

    const handleClear = (e) => {
        e.preventDefault();

        setVendorFormData({
            vendorname: "",
            vendorid: "",
            vendordesc: "",
            vendorTAN: "",
            vendorPAN: "",
            vendor206comp: "No",
            vendorPANstatus: "Inactive",
            vendoremailID: ""
        });

    }


    return (
        <div className='vendor-details-page'>

            <form>
                <h2>Vendor Details</h2>

                {/* Basic Information Fieldset */}
                <fieldset>
                    <legend>Basic Information</legend>

                    <label htmlFor="vid">ID:</label>
                    <input
                        type="text"
                        id="vid"
                        className="vendorid"
                        value={vendorFormData.vendorid}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="vname">Name:</label>
                    <input
                        type="text"
                        id="vname"
                        className="vendorname"
                        value={vendorFormData.vendorname}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="vemail">Email:</label>
                    <input
                        type="email"
                        id="vemail"
                        className="vendoremailID"
                        value={vendorFormData.vendoremailID}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="vdesc">Description:</label>
                    <textarea
                        id="vdesc"
                        className="vendordesc"
                        value={vendorFormData.vendordesc}
                        onChange={handleChange}
                        required
                    ></textarea>
                </fieldset>

                {/* Tax Details Fieldset */}
                <fieldset>
                    <legend>Tax Details</legend>

                    <label htmlFor="vpan">PAN:</label>
                    <input
                        type="text"
                        id="vpan"
                        className="vendorPAN"
                        value={vendorFormData.vendorPAN}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="vpanStatus">PAN Status:</label>
                    <select
                        id="vpanStatus"
                        className="vendorPANstatus"
                        value={vendorFormData.vendorPANstatus}
                        onChange={handleChange}
                    >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                    </select>

                    <label htmlFor="vtan">TAN:</label>
                    <input
                        type="text"
                        id="vtan"
                        className="vendorTAN"
                        value={vendorFormData.vendorTAN}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="vcompliance">206 Compliance:</label>
                    <select
                        id="vcompliance"
                        className="vendor206comp"
                        value={vendorFormData.vendor206comp}
                        onChange={handleChange}
                    >
                        <option value="non-compliant">Non-Compliant</option>
                        <option value="compliant">Compliant</option>
                    </select>
                </fieldset>

                <div>
                    <button type="submit" onClick={handleSubmit}>Submit</button>
                    <button type="reset" onClick={handleClear}>Clear Form</button>
                </div>
            </form>

        </div>
    )
}

export default VendorDetails