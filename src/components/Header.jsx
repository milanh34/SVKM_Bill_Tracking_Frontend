import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import image from "../assets/svkmHeader.svg";
import Cookies from 'js-cookie';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Create Bill", path: "/create-bill" },
    { name: "Checklist", path: "/checklist" },
    { name: "Reports", path: "/reports" },
    { name: "Admin", path: "/admin" },
    { name: "Profile", path: "/profile" },
  ];

  const roles = [
    { value: "Site_Officer", label: "Site Officer" },
    { value: "QS_Team", label: "QS Team" },
    { value: "PIMO_Mumbai_&_MIGO/SES_Team", label: "PIMO Mumbai & MIGO/SES Team" },
    { value: "PIMO_Mumbai_for_Advance_&_FI_Entry", label: "PIMO Mumbai for Advance & FI Entry" },
    { value: "Accounts_Team", label: "Accounts Team" },
    { value: "Trustee,_Advisor_&_Director", label: "Trustee, Advisor & Director" },
    { value: "Admin", label: "Admin" }
  ];

  const roleMap = {
    Site_Officer: "site_officer",
    QS_Team: "qs_site",
    "PIMO_Mumbai_&_MIGO/SES_Team": "site_pimo",
    "PIMO_Mumbai_for_Advance_&_FI_Entry": "pimo_mumbai",
    Accounts_Team: "accounts",
    "Trustee,_Advisor_&_Director": "director",
    Admin: "admin",
  };

  const getActiveClass = (path) => {
    if (path === "/") {
      return location.pathname === path 
        ? "bg-[#f5f5f5] text-[#011a99] shadow-md" 
        : "text-white hover:bg-[#cacaf8] hover:text-[#011a99]";
    }
    return location.pathname.startsWith(path) 
      ? "bg-[#f5f5f5] text-[#011a99] shadow-md" 
      : "text-white hover:bg-[#cacaf8] hover:text-[#011a99]";
  };

  const handleLogout = () => {
    // Clear all cookies
    Cookies.remove('token');
    Cookies.remove('userRole');
    Cookies.remove('userEmail');
    Cookies.remove('userId');
    navigate("/login");
  };

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    const mappedRole = roleMap[newRole];
    const cookieExpiry = 0.333; // 8 hours
    
    Cookies.set('userRole', mappedRole, { expires: cookieExpiry });
    window.location.reload();
  };

  return (
    <div className="relative z-20">
      <div className="w-full bg-transparent">
        <img 
          src={image}
          alt="Header" 
          className="w-full"
        />
      </div>
      <div className="absolute w-full top-[63%] max-xl:h-1/3 max-lg:h-1/4 flex justify-end">
      <div className="bg-[#364cbb] w-[91.2%] flex items-center justify-between overflow-x-auto">
          <div className="inline-flex items-center xl:gap-8 lg:gap-5 gap-1 px-2 sm:px-4 md:px-6 py-1 min-w-0">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`text-xs md:text-sm rounded-xl px-2 sm:px-3 md:px-4 py-1.5 max-lg:py-0 
                  whitespace-nowrap transition-all duration-200 cursor-pointer min-w-fit
                  ${getActiveClass(item.path)}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-2 px-2 sm:px-4 md:px-6 py-1 shrink-0">
            <div className="w-40 min-w-[120px]">
              <select 
                className="w-full bg-[#011a99] outline-none text-white rounded-2xl font-medium 
                text-xs sm:text-sm appearance-none px-2 py-1 hover:bg-[#011889] cursor-pointer"
              onChange={handleRoleChange}
                defaultValue=""
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center'
                }}
              >
                <option value="" disabled hidden>Switch Role</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value} className="bg-white text-black">
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-28 min-w-[80px]">
              <button 
                className="w-full bg-[#011a99] text-white rounded-2xl font-medium text-xs sm:text-sm px-2 py-1 hover:bg-[#011889] cursor-pointer"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
