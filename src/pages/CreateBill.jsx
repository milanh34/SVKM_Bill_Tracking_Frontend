import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const CreateBill = () => {
  const navigate = useNavigate();

  const buttons = [
    { path: '/billqs', label: 'Create Bill as QS Team' },
    { path: '/billpimo', label: 'Create Bill as PIMO Team' },
    { path: '/billsiso', label: 'Create Bill as SISO Team' }
  ];

  return (
    <div>
      <Header />
      <div className="mt-5">
        {buttons.map((button) => (
          <button
            key={button.path}
            className="bg-[#364cbb] text-white font-semibold px-[1.4vw] py-[0.65vw] ml-5 rounded-[1vw] border-none cursor-pointer whitespace-nowrap text-[0.9vw] transition-all duration-200 hover:bg-[#2a3c9e] hover:-translate-y-0.5 shadow-md"
            onClick={() => navigate(button.path)}
          >
            {button.label}
          </button>
        ))}
      </div>
      <p className="pt-[15vh] text-[#313131] font-semibold text-[20px] text-center">
        Select type of bill to create
      </p>
    </div>
  );
};

export default CreateBill;
