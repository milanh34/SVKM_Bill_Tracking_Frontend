import SERVER_API from "./server.api.js";

export const bills = `${SERVER_API}/bill`;
export const report = `${SERVER_API}/report/generate-report`;
export const importReport = `${SERVER_API}/report/import-report`;
export const receiveBills = `${SERVER_API}/bill/receiveBill`;
export const paymentInstructions = `${SERVER_API}/bill/payment-instructions`;
export const sentBills = `${SERVER_API}/sentBills`;
export const deleteAttachments = `${SERVER_API}/bill/attachment`;
export const importExcel = `${SERVER_API}/excel`;
