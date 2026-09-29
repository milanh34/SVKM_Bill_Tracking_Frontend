import SERVER_API from "./server.api.js";

// Forms repository (29.09, reply Q2): list and download for every team,
// upload and delete for Admin.
export const formsList = `${SERVER_API}/forms`;
export const formsUpload = `${SERVER_API}/forms/upload`;
export const formDownload = (id) => `${SERVER_API}/forms/download/${id}`;
export const formDelete = (id) => `${SERVER_API}/forms/${id}`;
