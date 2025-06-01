import axios from "axios";

// Get API URLs with fallbacks
const getApiUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use runtime environment
    return (
      import.meta.env.PUBLIC_APP_PUBLIC_API_URL ||
      "http://localhost:3000/pub/api"
    );
  } else {
    // Server-side/build-time: use build environment
    return (
      import.meta.env.APP_PUBLIC_API_URL || "http://localhost:3000/pub/api"
    );
  }
};

const getPrivateApiUrl = () => {
  return import.meta.env.APP_API_URL || "http://localhost:3000/api";
};

export const pub = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

export const api = axios.create({
  baseURL: getPrivateApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});
