import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import image from "../assets/svkmHeader.svg";
import Cookies from "js-cookie";
import profile from "../assets/profile.svg";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = Cookies.get("userRole");
  const availableRoles = JSON.parse(Cookies.get("availableRoles") || "[]");

  const roleDisplayMap = {
    site_officer: "Site Team",
    qs_site: "QS Team",
    site_pimo: "PIMO Mumbai Team",
    // 'pimo_mumbai': 'Advance & Direct FI Entry',
    accounts: "Accounts Team",
    director: "Trustee, Advisor & Director",
    admin: "Admin",
  };

  const menuItems = [
    // { name: "Home", path: "/", allowedRoles: ["site_officer", "site_pimo", "accounts", "director", "qs_site"], },
    { name: "Home", path: "/", allowedRoles: ["all"], },
    {
      name: "Create Bill",
      path: "/create-bill",
      allowedRoles: ["site_officer", "site_pimo"],
    },
    { name: "Reports", path: "/reports", allowedRoles: ["all"] },
    {
      name: "Forwarded Bills",
      path: "/forwardedbills",
      allowedRoles: ["site_officer", "site_pimo", "director", "accounts"],
    },
    { name: "Masters", path: "/admin", allowedRoles: ["admin"] },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.allowedRoles.includes("all")) return true;
    return item.allowedRoles.includes(userRole);
  });

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
    Cookies.remove("availableRegions");
    Cookies.remove("availableRoles");
    Cookies.remove("token");
    Cookies.remove("userEmail");
    Cookies.remove("userId");
    Cookies.remove("userName");
    Cookies.remove("userRole");
    navigate("/login");
  };

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    const cookieExpiry = 0.333; // 8 hours
    Cookies.set("userRole", newRole, { expires: cookieExpiry });
    window.location.reload();
  };

  return (
    <div className="relative z-20">
      <div className="w-full bg-transparent flex flex-row items-center relative">
        <img src={image} alt="Header" className="w-full" />
        <div className="mb-10 cursor-pointer absolute right-5">
          <img src={profile} onClick={() => navigate("/profile")} />
        </div>
      </div>
      <div className="absolute w-full top-[63%] max-xl:h-1/3 max-lg:h-1/4 flex justify-end">
        <div className="bg-[#364cbb] w-[91.2%] flex items-center justify-between overflow-x-auto">
          <div className="inline-flex items-center xl:gap-8 lg:gap-5 gap-1 px-2 sm:px-4 md:px-6 py-1 min-w-0">
            {filteredMenuItems.map((item) => (
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
            <div className="min-w-[120px]">
              <select
                className="w-full bg-[#011a99] outline-none text-white rounded-2xl font-medium 
                text-xs sm:text-sm appearance-none pr-6 px-2 py-1 hover:bg-[#011889] cursor-pointer"
                onChange={handleRoleChange}
                value={userRole}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                }}
              >
                {availableRoles.map(
                  (role) =>
                    role !== "pimo_mumbai" && (
                      <option
                        key={role}
                        value={role}
                        className="bg-white text-black"
                      >
                        {roleDisplayMap[role] || role}
                      </option>
                    )
                )}
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
