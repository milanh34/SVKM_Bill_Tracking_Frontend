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

import ReportsEmpty from "./pages/reports/ReportsEmpty";
// import RepRecMumbai from "./pages/reports/RepRecMumbai";
// import BillJourney from "./pages/reports/BillJourney";

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

// final reports
import InvAtSite from "./pages/reports/InvAtSite";
import InvAtPIMO from "./pages/reports/InvAtPIMO";
import InvQsMeasurement from "./pages/reports/InvQsMeasurement";
import InvQSSiteProvCop from "./pages/reports/InvQSSiteProvCop";
import InvQSSiteCOP from "./pages/reports/InvQSSiteCOP";
import InvReturnQsAfterMeasurement from "./pages/reports/InvReturnQsAfterMeasurement";
import InvReturnQsAfterProvCOP from "./pages/reports/InvReturnQsAfterProvCOP";
import InvReturnQsAfterCOP from "./pages/reports/InvReturnQsAfterCOP";
import InvSentToAccts from "./pages/reports/InvSentToAccts";
import InvSentToPIMO from "./pages/reports/InvSentToPIMO";
import RepBillOutstanding from "./pages/reports/RepBillOutstanding";
import RepBillOutstandingSubtotal from "./pages/reports/RepBillOutstandingSubtotal";
import InvPaid from "./pages/reports/InvPaid";
import VendorTable from "./components/admin/VendorTable";
import VendorTablePage from "./pages/VendorTablePage";

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
              allowedRoles={["site_officer", "site_pimo"]}
            />
          }
        />
        <Route
          path="/forwardedbills"
          element={
            <ProtectedRoute
              element={SentBills}
              allowedRoles={["site_officer", "site_pimo", "director", "accounts"]}
            />
          }
        />

        {/* REPORTS */}
        <Route path="/reports" element={<ReportsEmpty />} />
        <Route
          path="/invatsite"
          element={
            <ProtectedRoute
              element={InvAtSite}
              allowedRoles={["site_officer", "site_pimo", "director", "admin"]}
            />
          }
        />
        <Route
          path="/invatpimo"
          element={
            <ProtectedRoute
              element={InvAtPIMO}
              allowedRoles={["site_pimo", "director", "admin"]}
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
          path="/invqsmeasurement"
          element={
            <ProtectedRoute
              element={InvQsMeasurement}
              allowedRoles={["site_officer", "qs_site", "site_pimo", "admin"]}
            />
          }
        />
        <Route
          path="/invqsprovcop"
          element={
            <ProtectedRoute
              element={InvQSSiteProvCop}
              allowedRoles={["site_officer", "qs_site", "site_pimo", "admin"]}
            />
          }
        />
        <Route
          path="/invqsmumbaicop"
          element={
            <ProtectedRoute
              element={InvQSSiteCOP}
              allowedRoles={["qs_site", "site_pimo", "admin"]}
            />
          }
        />
        <Route
          path="/invsentpimo"
          element={
            <ProtectedRoute
              element={InvSentToPIMO}
              allowedRoles={["site_officer", "site_pimo", "admin"]}
            />
          }
        />
        <Route
          path="/invreturnqsmeasurement"
          element={
            <ProtectedRoute
              element={InvReturnQsAfterMeasurement}
              allowedRoles={["qs_site", "admin"]}
            />
          }
        />
        <Route
          path="/invreturnqsprovcop"
          element={
            <ProtectedRoute
              element={InvReturnQsAfterProvCOP}
              allowedRoles={["qs_site", "admin"]}
            />
          }
        />
        <Route
          path="/invreturnqsmumbaicop"
          element={
            <ProtectedRoute
              element={InvReturnQsAfterCOP}
              allowedRoles={["qs_site", "admin"]}
            />
          }
        />
        <Route
          path="/invsentaccts"
          element={
            <ProtectedRoute
              element={InvSentToAccts}
              allowedRoles={["site_pimo", "admin"]}
            />
          }
        />
        <Route
          path="/invpaid"
          element={
            <ProtectedRoute
              element={InvPaid}
              allowedRoles={["accounts", "admin"]}
            />
          }
        />

        <Route
          path="/checklist-advance2"
          element={
            <ProtectedRoute
              element={AdvancedChecklist2}
              allowedRoles={["site_pimo", "site_officer"]}
            />
          }
        />

        <Route
          path="/checklist-directFI2"
          element={
            <ProtectedRoute
              element={ChecklistDirectFI2}
              allowedRoles={["site_pimo", "site_officer"]}
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

        <Route path="/vendor-master" element={<VendorTablePage />} />

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
