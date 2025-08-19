import SERVER_API from "./server.api.js";

export const bills = `${SERVER_API}/bill`;
export const getFilteredBills = `${SERVER_API}/bill/get-filtered-bills`;
export const report = `${SERVER_API}/report/generate-report`;
export const importReport = `${SERVER_API}/report/import-report`;
export const receiveBills = `${SERVER_API}/bill/receiveBill`;
export const notReceivedPimo = `${SERVER_API}/bill/not-received-pimo`;
export const notReceivedAccounts = `${SERVER_API}/bill/not-received-account`;
export const rejectPayment = `${SERVER_API}/bill/reject-payment`;
export const paymentInstructions = `${SERVER_API}/bill/payment-instructions`;
export const sentBills = `${SERVER_API}/sentBills`;
export const deleteAttachments = `${SERVER_API}/bill/attachment`;
export const importExcel = `${SERVER_API}/excel`;
