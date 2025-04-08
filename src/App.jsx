import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages_tailwind/Login";
import Reports2 from "./pages_tailwind/Reports2_old";
import Reports3 from "./pages_tailwind/Reports3_old";
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
import CreateBill from './pages_tailwind/CreateBill'
import BillDetailsQS from './pages_tailwind/BillDetailsQS'
import BillDetailsSISO from './pages_tailwind/BillDetailsSISO'
import BillDetailsPIMO from './pages_tailwind/BillDetailsPIMO'

import BillDetails from './pages/BillDetails'
import ContactPage from './pages/ContactPage'
import Checklist from './pages/Checklist'
import InvoiceTable from './pages/InvoiceTable'
import BillSend from './pages/BillSend'
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
