import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import FullBillDetails from "./pages/FullBill";
import SentBills from "./pages/SentBills";
import Profile from "./pages/Profile";
import UpdatePassword from "./pages/UpdatePassword";
import ForgotPassword from "./pages/ForgotPassword";

import RepRecAtSite from "./pages/reports/RepRecAtSite";
import RepRecMumbai from "./pages/reports/RepRecMumbai";
import ReportsEmpty from "./pages/reports/ReportsEmpty";
import ReportsPending from "./pages/reports/ReportsPending";
import InvoicesGivenToQSSite from "./pages/reports/InvoiceQSSite";
import RepCourier from "./pages/reports/RepCourier";
import RepBillOutstanding from "./pages/reports/RepBillOutstanding";
import RepBillOutstandingSubtotal from "./pages/reports/RepBillOutstandingSubtotal";
import InvoicesGivenToAccountDept from "./pages/reports/InvoiceAccountDepartment";
import InvoicesPaid from "./pages/reports/InvoicePaid";
import BillJourney from "./pages/reports/BillJourney";

import ChecklistDirectFI2 from "./pages/checklists/ChecklistDirectFI2";
import AdvancedChecklist2 from "./pages/checklists/AdvancedChecklist2";
import ChecklistAccount2 from "./pages/checklists/ChecklistAccount2";
import ChecklistBillJourney from "./pages/checklists/ChecklistBillJourney";

// Not being used
import BillDetailsQS from "./pages/archive/BillDetailsQS";
import BillDetailsSISO from "./pages/archive/BillDetailsSISO";
import BillDetailsPIMO from "./pages/archive/BillDetailsPIMO";
import ContactPage from "./pages/archive/ContactPage";
import InvoiceTable from "./pages/archive/InvoiceTable";
import ChecklistBillList from "./pages/archive/ChecklistBillList";
import AdvancedChecklist from "./pages/archive/AdvancedChecklist";
import ChecklistDirectFI from "./pages/archive/ChecklistDirectFI";
import ChecklistAccount from "./pages/archive/ChecklistAccount";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/updatepass" element={<UpdatePassword />} />
        <Route path="/forgotpass" element={<ForgotPassword />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={<ProtectedRoute element={Admin} allowedRoles={["admin"]} />}
        />
        <Route
          path="/create-bill"
          element={
            <ProtectedRoute
              element={FullBillDetails}
              allowedRoles={["site_officer", "site_pimo", "admin"]}
            />
          }
        />
        <Route
          path="/forwardedbills"
          element={
            <ProtectedRoute
              element={SentBills}
              allowedRoles={["site_officer", "site_pimo", "accounts"]}
            />
          }
        />

        <Route path="/reports" element={<ReportsEmpty />} />
        <Route
          path="/reportsrecatsite"
          element={
            <ProtectedRoute
              element={RepRecAtSite}
              allowedRoles={[
                "site_officer",
                "site_pimo",
                "pimo_mumbai",
                "director",
                "admin",
              ]}
            />
          }
        />

        <Route
          path="/reportsbilloutstanding"
          element={
            <ProtectedRoute
              element={RepBillOutstanding}
              allowedRoles={["accounts", "director", "admin"]}
            />
          }
        />
        <Route
          path="/reportsbilloutstandingsubtotal"
          element={
            <ProtectedRoute
              element={RepBillOutstandingSubtotal}
              allowedRoles={["accounts", "director", "admin"]}
            />
          }
        />

        <Route
          path="/reportscouriermumbai"
          element={
            <ProtectedRoute
              element={RepCourier}
              allowedRoles={["site_officer", "site_pimo", "director", "admin"]}
            />
          }
        />
        <Route
          path="/reportsreceivedmumbai"
          element={
            <ProtectedRoute
              element={RepRecMumbai}
              allowedRoles={["site_pimo", "director", "admin"]}
            />
          }
        />
        <Route
          path="/reportsinvoiceacctdept"
          element={
            <ProtectedRoute
              element={InvoicesGivenToAccountDept}
              allowedRoles={["site_pimo", "accounts", "director", "admin"]}
            />
          }
        />
        <Route
          path="/reportsinvoiceqssite"
          element={
            <ProtectedRoute
              element={InvoicesGivenToQSSite}
              allowedRoles={["director", "admin"]}
            />
          }
        />
        <Route
          path="/reportsinvoicepaid"
          element={
            <ProtectedRoute
              element={InvoicesPaid}
              allowedRoles={["accounts", "director", "admin"]}
            />
          }
        />
        <Route
          path="/reportspending"
          element={
            <ProtectedRoute
              element={ReportsPending}
              allowedRoles={["site_pimo", "director", "admin"]}
            />
          }
        />
        <Route
          path="/reportsbilljourney"
          element={
            <ProtectedRoute
              element={BillJourney}
              allowedRoles={["accounts", "director", "admin"]}
            />
          }
        />

        <Route
          path="/checklist-advance2"
          element={
            <ProtectedRoute
              element={AdvancedChecklist2}
              allowedRoles={["site_pimo"]}
            />
          }
        />

        <Route
          path="/checklist-directFI2"
          element={
            <ProtectedRoute
              element={ChecklistDirectFI2}
              allowedRoles={["site_pimo"]}
            />
          }
        />

        <Route
          path="/checklist-account2"
          element={
            <ProtectedRoute
              element={ChecklistAccount2}
              allowedRoles={["accounts"]}
            />
          }
        />

        <Route
          path="/checklist-bill-journey"
          element={
            <ProtectedRoute
              element={ChecklistBillJourney}
              allowedRoles={["site_officer"]}
            />
          }
        />

        {/* Not being used */}
        <Route path="/billqs" element={<BillDetailsQS />} />
        <Route path="/billsiso" element={<BillDetailsSISO />} />
        <Route path="/billpimo" element={<BillDetailsPIMO />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/invoicetable" element={<InvoiceTable />} />
        <Route path="/checklist-bill-list" element={<ChecklistBillList />} />
        <Route path="/checklist-directFI" element={<ChecklistDirectFI />} />
        <Route path="/checklist-advance" element={<AdvancedChecklist />} />
        <Route path="/checklist-account" element={<ChecklistAccount />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
