import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages_tailwind/Login";
import Dashboard from "./pages_tailwind/Dashboard";
import Admin from "./pages_tailwind/Admin";
import FullBillDetails from "./pages_tailwind/FullBill";
import PaidBills from "./pages_tailwind/PaidBills";
import Profile from "./pages_tailwind/Profile";
import RepRecAtSite from './pages_tailwind/RepRecAtSite'
import RepRecMumbai from './pages_tailwind/RepRecMumbai'
import ReportsEmpty from './pages_tailwind/ReportsEmpty'
import ReportsPending from './pages_tailwind/ReportsPending'
import InvoicesGivenToQSSite from './pages_tailwind/InvoiceQSSite'
import RepCourier from './pages_tailwind/RepCourier'
import RepBillOutstanding from './pages_tailwind/RepBillOutstanding'
import RepBillOutstandingSubtotal from './pages_tailwind/RepBillOutstandingSubtotal'
import InvoicesGivenToAccountDept from './pages_tailwind/InvoiceAccountDepartment'
import InvoicesPaid from './pages_tailwind/InvoicePaid'
import BillJourney from './pages_tailwind/BillJourney'
// import CreateBill from './pages_tailwind/CreateBill'
import BillDetailsQS from './pages_tailwind/BillDetailsQS'
import BillDetailsSISO from './pages_tailwind/BillDetailsSISO'
import BillDetailsPIMO from './pages_tailwind/BillDetailsPIMO'

import ContactPage from './pages_tailwind/ContactPage'
import InvoiceTable from './pages_tailwind/InvoiceTable'
import ChecklistBillList from "./pages_tailwind/ChecklistBillList";
import ChecklistDirectFI from "./pages_tailwind/ChecklistDirectFI";
import AdvancedChecklist from "./pages/AdvancedChecklist";
import ChecklistAccount from "./pages_tailwind/ChecklistAccount";
import ChecklistBillJourney from "./pages_tailwind/ChecklistBillJourney";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Tailwind Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/fullbill" element={<FullBillDetails />} />

        {/* Other Routes */}
        <Route path='/reports' element={<ReportsEmpty />} />
        <Route path='/contact' element={<ContactPage />} />

        <Route path='/reportsrecatsite' element={<RepRecAtSite />} />
        <Route path='/reportsbilloutstanding' element={<RepBillOutstanding />} />
        <Route path='/reportsbilloutstandingsubtotal' element={<RepBillOutstandingSubtotal />} />
        <Route path='/reportscouriermumbai' element={<RepCourier />} />
        <Route path='/reportsreceivedmumbai' element={<RepRecMumbai />} />
        <Route path='/reportsinvoiceacctdept' element={<InvoicesGivenToAccountDept />}/>
        <Route path='/reportsinvoiceqssite' element={<InvoicesGivenToQSSite />}/>
        <Route path='/reportsinvoicepaid' element={<InvoicesPaid />}/>
        <Route path='/reportspending' element={<ReportsPending />} />
        <Route path='/reportsbilljourney' element={<BillJourney />}/>
        
        <Route path='/invoicetable' element={<InvoiceTable />}/>

        <Route path='/billqs' element={<BillDetailsQS />}/>
        <Route path='/billsiso' element={<BillDetailsSISO />}/>
        <Route path='/billpimo' element={<BillDetailsPIMO />}/>
        <Route path='/reportsbilljourney' element={<BillJourney />}/>
        <Route path='/checklist-advance' element={<AdvancedChecklist />} />
        <Route path='/checklist-directFI' element={<ChecklistDirectFI />} />
        <Route path='/checklist-account' element={<ChecklistAccount />} />
        <Route path='/checklist-bill-list' element={<ChecklistBillList />} />
        <Route path='/checklist-bill-journey' element={<ChecklistBillJourney />} />
        {/* <Route path='/create-bill' element={<CreateBill />} /> */}
        <Route path='/create-bill' element={<FullBillDetails />} />

        <Route path="/paidbills" element={<PaidBills />} />
        
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
