import axios from "axios";

export const uriBase = 'http://localhost:5103'
export const baseURL = `${uriBase}/api`;

export const api = axios.create({
  baseURL
});
