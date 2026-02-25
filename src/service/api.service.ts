import axios from "axios";

// export const uriBase = 'http://192.168.18.64:5097';
// export const uriBase = 'http://localhost:5097';
export const uriBase = 'https://api.erpmais.online'
// export const uriBase = process.env.NEXT_PUBLIC_API_URL;
export const baseURL = `${uriBase}/api`;

export const api = axios.create({
  baseURL
});
