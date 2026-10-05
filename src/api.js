// All communication with the backend goes through this file.
const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000/api/v1";

// The seeded demo merchant. Used when nobody is logged in, so the demo still works.
// A real merchant would call the API from their own server and never expose a secret key.
const DEMO_SECRET_KEY = "sk_test_demo";

const SESSION_KEY = "gateway_session";

// ---- session (token and merchant profile, saved in the browser) ----
export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
};

export const saveSession = (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session));

export const clearSession = () => localStorage.removeItem(SESSION_KEY);

export const isLoggedIn = () => Boolean(getSession()?.token);

/** The key used for merchant calls: the logged-in merchant's own key, otherwise the demo key. */
export const getSecretKey = () => getSession()?.user?.secret_key || DEMO_SECRET_KEY;

// ---- money ----
/** 5000 (naira) -> 500000 (kobo). The API stores amounts in the smallest unit. */
export const toKobo = (naira) => Math.round(Number(naira) * 100);

/** 500000 -> "₦5,000.00" */
export const formatMoney = (kobo, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(kobo) / 100);

export const formatDate = (value) => (value ? new Date(value).toLocaleString() : "-");

// ---- request helper ----
async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    const details = Array.isArray(json?.errors) ? json.errors.map((e) => e.message).join(". ") : "";
    throw new ApiError(details || json?.message || "Something went wrong", response.status);
  }

  return json.data;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ---- accounts ----
export const register = ({ businessName, email, password }) =>
  request("/users/register", { method: "POST", body: { business_name: businessName, email, password } });

export const login = (email, password) => request("/users/login", { method: "POST", body: { email, password } });

export const updateWebhookUrl = (webhookUrl) =>
  request("/users/webhook-url", {
    method: "PATCH",
    body: { webhook_url: webhookUrl },
    token: getSession()?.token,
  });

// ---- public checkout (no key needed, used by the customer) ----
export const getCheckout = (reference) => request(`/checkout/${encodeURIComponent(reference)}`);

export const payCheckout = (reference, card) =>
  request(`/checkout/${encodeURIComponent(reference)}/pay`, { method: "POST", body: card });

export const cancelCheckout = (reference) =>
  request(`/checkout/${encodeURIComponent(reference)}/cancel`, { method: "POST" });

// ---- merchant payments (secret key) ----
export const initiatePayment = ({ amountNaira, email, name }) =>
  request("/payments/initiate", {
    method: "POST",
    token: getSecretKey(),
    body: { amount: toKobo(amountNaira), email, metadata: name ? { name } : {} },
  });

export const listPayments = ({ status, page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set("status", status);
  return request(`/payments?${params}`, { token: getSecretKey() });
};

export const verifyPayment = (reference) =>
  request(`/payments/verify/${encodeURIComponent(reference)}`, { token: getSecretKey() });

export const refundPayment = (reference) =>
  request(`/payments/${encodeURIComponent(reference)}/refund`, { method: "POST", token: getSecretKey() });
