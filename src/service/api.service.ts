import axios from "axios";

export const uriBase = process.env.NEXT_PUBLIC_API_URL;
export const baseURL = `${uriBase}/api`;

export const api = axios.create({
  baseURL
});
