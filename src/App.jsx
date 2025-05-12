import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import FullBillDetails from "./pages/FullBill";
import SentBills from "./pages/SentBills";
import Profile from "./pages/Profile";
import RepRecAtSite from './pages/RepRecAtSite'
import RepRecMumbai from './pages/RepRecMumbai'
import ReportsEmpty from './pages/ReportsEmpty'
import ReportsPending from './pages/ReportsPending'
import InvoicesGivenToQSSite from './pages/InvoiceQSSite'
import RepCourier from './pages/RepCourier'
import RepBillOutstanding from './pages/RepBillOutstanding'
import RepBillOutstandingSubtotal from './pages/RepBillOutstandingSubtotal'
import InvoicesGivenToAccountDept from './pages/InvoiceAccountDepartment'
import InvoicesPaid from './pages/InvoicePaid'
import BillJourney from './pages/BillJourney'
// import CreateBill from './pages/CreateBill'
import BillDetailsQS from './pages/BillDetailsQS'
import BillDetailsSISO from './pages/BillDetailsSISO'
import BillDetailsPIMO from './pages/BillDetailsPIMO'

import ContactPage from './pages/ContactPage'
import InvoiceTable from './pages/InvoiceTable'
import ChecklistBillList from "./pages/ChecklistBillList";
import ChecklistDirectFI from "./pages/ChecklistDirectFI";
import ChecklistDirectFI2 from "./pages/ChecklistDirectFI2";
import AdvancedChecklist from "./pages/AdvancedChecklist";
import AdvancedChecklist2 from "./pages/AdvancedChecklist2";
import ChecklistAccount from "./pages/ChecklistAccount";
import ChecklistAccount2 from "./pages/ChecklistAccount2";
import ChecklistBillJourney from "./pages/ChecklistBillJourney";
import UpdatePassword from "./pages/UpdatePassword";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Tailwind Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/updatepass" element={<UpdatePassword />} />
        <Route path="/forgotpass" element={<ForgotPassword />} />
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
        <Route path='/checklist-advance2' element={<AdvancedChecklist2 />} />
        <Route path='/checklist-directFI' element={<ChecklistDirectFI />} />
        <Route path='/checklist-directFI2' element={<ChecklistDirectFI2 />} />  {/* just trying */}
        <Route path='/checklist-account' element={<ChecklistAccount />} />
        <Route path='/checklist-account2' element={<ChecklistAccount2 />} />  {/* just trying */}
        <Route path='/checklist-bill-list' element={<ChecklistBillList />} />
        <Route path='/checklist-bill-journey' element={<ChecklistBillJourney />} />
        {/* <Route path='/create-bill' element={<CreateBill />} /> */}
        <Route path='/create-bill' element={<FullBillDetails />} />

        <Route path="/forwardedbills" element={<SentBills />} />
        
        <Route path="/profile" element={<Profile />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
