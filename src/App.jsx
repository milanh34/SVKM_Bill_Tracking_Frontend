import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Reports2 from "./pages/Reports2_old";
import Reports3 from "./pages/Reports3_old";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import FullBillDetails from "./pages/FullBill";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/r2" element={<Reports2 />} />
        <Route path="/r3" element={<Reports3 />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/fullbill" element={<FullBillDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
