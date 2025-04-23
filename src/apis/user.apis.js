import SERVER_API from "./server.api.js";

export const register = `${SERVER_API}/auth/register`;
export const login = `${SERVER_API}/auth/login`;
export const user = `${SERVER_API}/auth/me`;

export const updatePassword = `${SERVER_API}/auth/update-password`;

export const forgotPassword = `${SERVER_API}/users/forgot-password`;
export const verifyResetCode = `${SERVER_API}/users/verify-reset-code`;
export const resetPassword = `${SERVER_API}/users/reset-password`;