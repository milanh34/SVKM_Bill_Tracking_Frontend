import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/updatepass" element={<UpdatePassword />} />
        <Route path="/forgotpass" element={<ForgotPassword />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/create-bill" element={<FullBillDetails />} />
        <Route path="/forwardedbills" element={<SentBills />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/reports" element={<ReportsEmpty />} />
        <Route path="/reportsrecatsite" element={<RepRecAtSite />} />
        <Route path="/reportsbilloutstanding" element={<RepBillOutstanding />} />
        <Route path="/reportsbilloutstandingsubtotal" element={<RepBillOutstandingSubtotal />} />
        <Route path="/reportscouriermumbai" element={<RepCourier />} />
        <Route path="/reportsreceivedmumbai" element={<RepRecMumbai />} />
        <Route path="/reportsinvoiceacctdept" element={<InvoicesGivenToAccountDept />} />
        <Route path="/reportsinvoiceqssite" element={<InvoicesGivenToQSSite />} />
        <Route path="/reportsinvoicepaid" element={<InvoicesPaid />} />
        <Route path="/reportspending" element={<ReportsPending />} />
        <Route path="/reportsbilljourney" element={<BillJourney />} />

        <Route path="/checklist-advance2" element={<AdvancedChecklist2 />} />
        <Route path="/checklist-directFI2" element={<ChecklistDirectFI2 />} />
        <Route path="/checklist-account2" element={<ChecklistAccount2 />} />
        <Route path="/checklist-bill-journey" element={<ChecklistBillJourney />} />

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
