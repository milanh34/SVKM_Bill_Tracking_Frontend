import React from "react";
import Cookies from "js-cookie";
import UnauthorizedPage from "./UnauthorizedPage";

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const userRole = Cookies.get("userRole");

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <UnauthorizedPage />;
  }

  return <Component />;
};

export default ProtectedRoute;
