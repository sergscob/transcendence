import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { APIURL } from "/config"

const API = axios.create({
  baseURL: APIURL,
});

API.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) logout();
    return Promise.reject(err);
  }
);

export default API;