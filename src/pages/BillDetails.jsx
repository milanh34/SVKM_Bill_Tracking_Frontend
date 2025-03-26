import { useState } from 'react';
import '../styles/BillDetails.css'
import Header from '../components/Header';

// Bill No 1
// Bill Date 2 
// Vendor ID 3
// Location 5
// Amount 6
// Image of Bill 7 
// Vendor Email ID 4 

const BillDetails = () => {

    const [billFormData, setBillFormData] = useState({
        billno: "",
        billdate: "",
        vendorId: "",
        location: "",
        billAmount: "",
        billImage: "",
        vendorEmail: "",
    });

    const handleChange = (e) => {
        e.preventDefault();

        let id = e.target.id;
        let val = e.target.value;

        setBillFormData({
            ...billFormData, [id]: val,
        })
    }

    return (

        <div className='outer'>

            <Header />

            <div className="bill-form-container">
                <h1 className="form-title">Bill Details</h1>

                <div className="form-group">
                    <label className="form-label" htmlFor='billname'>Name</label>
                    <input
                        type="text"
                        className="form-control form-billname bill-input"
                        id='billname'
                        value={billFormData.billname}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label" htmlFor="billno">Bill Number</label>
                        <input
                            type="text"
                            className="form-control bill-input"
                            id="billno"
                            value={billFormData.billno}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="billdate">Date</label>
                        <input
                            type="date"
                            className="form-control form-billdate bill-input"
                            id="billdate"
                            value={billFormData.billdate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="vendorId">Vendor ID</label>
                    <input
                        type="text"
                        className="form-control bill-input"
                        id="vendorId"
                        value={billFormData.vendorId}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="location">Location</label>
                    <input
                        type="text"
                        className="form-control bill-input"
                        id="location"
                        value={billFormData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="amount">Amount</label>
                    <input
                        type="number"
                        className="form-control bill-input"
                        id="billAmount"
                        value={billFormData.billAmount}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="vendorEmail">Vendor Email</label>
                    <input
                        type="email"
                        className="form-control bill-input"
                        id="vendorEmail"
                        value={billFormData.vendorEmail}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="upload-container">
                    <div className="upload-content">
                        <p className="upload-text">Upload image of the bill</p>
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='50' height='50'%3E%3Crect x='2' y='2' width='20' height='20' fill='none' stroke='%23ccc' stroke-width='2' rx='2'/%3E%3Cpath fill='%23ccc' d='M4 18 L8 12 L12 15 L18 8 L20 10 L20 18 L4 18'/%3E%3Ccircle cx='16' cy='8' r='2' fill='%23ccc'/%3E%3C/svg%3E" alt="Image placeholder" className='upload-icon' />
                    </div>
                    <input
                        type="file"
                        className='form-control form-control-input bill-input'
                        id="billImage"
                        value={billFormData.billImage}
                        onChange={handleChange}
                        required 
                    />
                </div>

                <button className="submit-button" type="submit">Submit</button>
            </div>


        </div>


    )
}

export default BillDetails;