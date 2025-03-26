import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/ReportsBasic.css';

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
      <div className="report-btn-container" style={{ marginTop: '20px' }}>
        {buttons.map((button) => (
          <button
            key={button.path}
            className="report-button report-btns"
            onClick={() => navigate(button.path)}
            style={{marginLeft: '20px'}}
          >
            {button.label}
          </button>
        ))}
      </div>
      <p
        style={{
          paddingTop: "15vh",
          color: "#313131",
          fontWeight: "600",
          fontSize: "20px",
          textAlign: "center",
        }}
      >
        Select type of bill to create
      </p>
    </div>
  );
};

export default CreateBill;
