import axios from "axios";
import Cookies from "js-cookie";
import SERVER_API from "./server.api.js";

/**
 * Attach the bearer token to every request aimed at our own API.
 *
 * Report routes sit behind `router.use(authenticate)`, which reads
 * `Authorization: Bearer <token>`, but none of the 16 pages in pages/reports
 * ever set it - so every report returned 401 and rendered no rows. The admin
 * tables set the header by hand on each call; doing the same in sixteen more
 * places would leave the next call site to be missed in the same way.
 *
 * Scoped to SERVER_API so the token is never sent to a third-party host, and
 * it defers to an Authorization header a caller has already set.
 */
axios.interceptors.request.use((config) => {
  const url = config.url || "";
  if (!SERVER_API || !url.startsWith(SERVER_API)) return config;

  const existing = config.headers?.Authorization ?? config.headers?.authorization;
  if (existing) return config;

  const token = Cookies.get("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;
