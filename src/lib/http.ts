import axios from "axios";

export const pub = axios.create({
  baseURL: import.meta.env.APP_PUBLIC_API_URL || "http://localhost:3000/pub/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = axios.create({
  baseURL: import.meta.env.APP_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
