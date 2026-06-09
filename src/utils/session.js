const SECRET_KEY = import.meta.env.VITE_SESSION_SECRET || "default_secret";
const STORAGE_KEY = "user";

const encodePayload = (data) => {
  try {
    const serialized = JSON.stringify(data);
    // Handle unicode characters for btoa
    const binary = String(serialized).replace(/[^\x00-\x7F]/g, (c) => {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    });
    return btoa(`${SECRET_KEY}${binary}`);
  } catch (error) {
    console.error("Failed to encode user session:", error);
    return null;
  }
};

const decodePayload = (rawValue) => {
  if (!rawValue) return null;
  try {
    const decoded = atob(rawValue);
    if (!decoded.startsWith(SECRET_KEY)) {
      return null;
    }
    const payload = decoded.slice(SECRET_KEY.length);
    // Handle unicode characters from btoa
    const jsonString = payload.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
      return String.fromCharCode(parseInt(grp, 16));
    });
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to decode user session:", error);
    return null;
  }
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);
  return decodePayload(rawValue);
};

export const persistUser = (user) => {
  if (typeof window === "undefined") return;
  if (!user) {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  const encoded = encodePayload(user);
  if (encoded) {
    window.sessionStorage.setItem(STORAGE_KEY, encoded);
  }
};

export const clearStoredUser = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem('token'); // Also clear token
};

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem('token') || null;
};

export const clearStoredToken = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem('token');
};


