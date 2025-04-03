import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages_tailwind/Login";
import Reports2 from "./pages_tailwind/Reports2_old";
import Reports3 from "./pages_tailwind/Reports3_old";
import Dashboard from "./pages_tailwind/Dashboard";
import Admin from "./pages_tailwind/Admin";
import FullBillDetails from "./pages_tailwind/FullBill";
import PaidBills from "./pages_tailwind/PaidBills";
import Profile from "./pages_tailwind/Profile";

import BillDetails from './pages/BillDetails'
import RepRecAtSite from './pages/RepRecAtSite'
import ContactPage from './pages/ContactPage'
import Checklist from './pages/Checklist'
import RepBillOutstanding from './pages/RepBillOutstanding'
import RepBillOutstandingSubtotal from './pages/RepBillOutstandingSubtotal'
import RepCourier from './pages/RepCourier'
import RepRecMumbai from './pages/RepRecMumbai'
import InvoiceTable from './pages/InvoiceTable'
import BillDetailsQS from './pages/BillDetailsQS'
import BillDetailsSISO from './pages/BillDetailsSISO'
import BillDetailsPIMO from './pages/BillDetailsPIMO'
import BillSend from './pages/BillSend'
import InvoicesGivenToAccountDept from './pages/InvoiceAccountDepartment'
import InvoicesGivenToQSSite from './pages/InvoiceQSSite'
import InvoicesPaid from './pages/InvoicePaid'
import ReportsPending from './pages/ReportsPending'
import BillJourney from './pages/BillJourney'
import ReportsEmpty from './pages/ReportsEmpty'
import CreateBill from './pages/CreateBill'
import ChecklistBillList from "./pages/ChecklistBillList";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Tailwind Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/r2" element={<Reports2 />} />
        <Route path="/r3" element={<Reports3 />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/fullbill" element={<FullBillDetails />} />

        {/* Other Routes */}
        <Route path='/bill' element={<BillDetails />} />
        <Route path='/reports' element={<ReportsEmpty />} />
        <Route path='/contact' element={<ContactPage />} />
        <Route path='/billsend' element={<BillSend />} />
        <Route path='/reportsrecatsite' element={<RepRecAtSite />} />
        <Route path='/reportsbilloutstanding' element={<RepBillOutstanding />} />
        <Route path='/reportsbilloutstandingsubtotal' element={<RepBillOutstandingSubtotal />} />
        <Route path='/reportscouriermumbai' element={<RepCourier />} />
        <Route path='/reportsreceivedmumbai' element={<RepRecMumbai />} />
        <Route path='/reportspending' element={<ReportsPending />} />
        <Route path='/invoicetable' element={<InvoiceTable />}/>
        <Route path='/reportsinvoiceacctdept' element={<InvoicesGivenToAccountDept />}/>
        <Route path='/reportsinvoiceqssite' element={<InvoicesGivenToQSSite />}/>
        <Route path='/reportsinvoicepaid' element={<InvoicesPaid />}/>
        <Route path='/billqs' element={<BillDetailsQS />}/>
        <Route path='/billsiso' element={<BillDetailsSISO />}/>
        <Route path='/billpimo' element={<BillDetailsPIMO />}/>
        <Route path='/reportsbilljourney' element={<BillJourney />}/>
        <Route path='/checklist' element={<Checklist />} />
        <Route path='/checklist-bill-list' element={<ChecklistBillList />} />
        <Route path='/create-bill' element={<CreateBill />} />
        <Route path="/paidbills" element={<PaidBills />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
