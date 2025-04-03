import React from 'react'
import Header from '../components/Header';
import { useLocation, useNavigate } from "react-router-dom";

const ChecklistBillList = () => {
    const navigate = useNavigate();

    const location = useLocation();
    const billList = location.state?.selectedRows;

    console.log("Checklist Bill List me aaye hue: ",billList);

    const handleChecklist = (item) => {
        navigate('/checklist', {state: {item}});
    }

    return (
        <div>
            <Header />
            <h1 className='text-[30px] mt-10 ml-10'>Selected Bills For Checklist</h1>
            {
                billList.map(item => {
                    return <div className='h-20 w-[90%] border m-auto mt-5 flex justify-between items-center px-[1vw]' onClick={() => handleChecklist(item)}>
                        {item}
                        <span className='h-fit py-[1vh] px-[2vw] border cursor-pointer bg-[#364CBB] text-[#fff] hover:bg-[#011A99]'>view Checklist</span>
                    </div>
                })
            }
        </div>
    )
}

export default ChecklistBillList
