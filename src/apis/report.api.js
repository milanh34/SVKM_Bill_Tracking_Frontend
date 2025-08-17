import SERVER_API from "./server.api.js";

export const billJourney = `${SERVER_API}/api/reports/bill-journey`;
export const givenToAccounts = `${SERVER_API}/api/reports/invoices-given-to-accounts`;
export const invoicesPaid = `${SERVER_API}/api/reports/invoices-paid`;
export const givenToQSSite = `${SERVER_API}/api/reports/invoices-given-to-qs-site`;
export const outstanding = `${SERVER_API}/api/reports/outstanding-bills`;
export const courieredMumbai = `${SERVER_API}/api/reports/invoices-courier-to-mumbai`;
export const pendingBills = `${SERVER_API}/api/reports/pending-bills`;
export const receivedAtSite = `${SERVER_API}/api/reports/invoices-received-at-site`;
export const receivedAtMumbai = `${SERVER_API}/api/reports/invoices-received-at-mumbai`;

export const receivedAtSitePIMO = `${SERVER_API}/api/reports/invoices-received-at-site-pimo`;
export const receivedAtSiteQS = `${SERVER_API}/api/reports/invoices-received-at-site-qs`;
export const patchBills = `${SERVER_API}/report/patch-bills`;


export const invAtSite = `${SERVER_API}/api/reports/invoices-received-at-site`
export const invAtPIMO = `${SERVER_API}/api/reports/invoices-received-at-pimo-mumbai`
export const invWithQsMeasurement = `${SERVER_API}/api/reports/invoices-received-at-qsmeasurement`
export const invWithQsProvCOP = `${SERVER_API}/api/reports/invoices-received-at-qscop`
export const invWithQsCOP = `${SERVER_API}/api/reports/invoices-received-at-qsmumbai`
export const invSentToPIMO = `${SERVER_API}/api/reports/invoices-courier-to-pimo-mumbai`
export const invReturnQsMeasurement = `${SERVER_API}/api/reports/invoices-returned-by-qsmeasurement`
export const invReturnQsProvCop = `${SERVER_API}/api/reports/invoices-returned-by-qscop`
export const invReturnQsCop = `${SERVER_API}/api/reports/invoices-returned-by-qsmumbai`
export const invSentToAccts = `${SERVER_API}/api/reports/invoices-given-to-accounts`
export const invPaid = `${SERVER_API}/api/reports/invoices-Paid`