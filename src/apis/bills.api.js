import SERVER_API from "./server.api.js";

export const bills = `${SERVER_API}/bill`;
export const filterBills = `${SERVER_API}/bill/filter`;
export const billWorkflow = `${SERVER_API}/bill-workflow`;
export const report = `${SERVER_API}/report/generate-report`;
export const importReport = `${SERVER_API}/report/import-report`;
