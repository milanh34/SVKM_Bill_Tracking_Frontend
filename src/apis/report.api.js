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