import React from 'react';

const AdminBtns = ({ activeTable, setActiveTable }) => {
    const masterButtons = [
        { id: 'vendors', label: 'Vendor Master' },
        { id: 'compliances', label: 'Compliance Master' },
        { id: 'panstatus', label: 'PAN Status Master' },
        { id: 'regions', label: 'Region Master' },
        { id: 'nature-of-works', label: 'Nature of Work Master' },
        { id: 'users', label: 'User Master' },
        { id: 'currencies', label: 'Currency Master' }
    ];

    const handleClick = (id) => {
        setActiveTable(id);
    };

    return (
        <div className='flex flex-wrap justify-start items-center gap-[1vw] mb-[1vh] px-[2vw] max-w-full'>
            {masterButtons.map(btn => (
                <button
                    key={btn.id}
                    onClick={() => handleClick(btn.id)}
                    className='bg-[#364cbb] text-white font-semibold px-[1.4vw] py-[0.5vw] rounded-[1vw] border-none cursor-pointer whitespace-nowrap text-[0.9vw] transition-all duration-200 hover:bg-[#2a3c9e] hover:-translate-y-0.5 shadow-md'
                    style={{
                        backgroundColor: activeTable === btn.id ? '#ffffff' : '#364CBB',
                        color: activeTable === btn.id ? "#000" : "#fff",
                        border: activeTable === btn.id ? "3px solid #364CBB" : "none"
                    }}
                >
                    {btn.label}
                </button>
            ))}
        </div>
    );
};

export default AdminBtns;
