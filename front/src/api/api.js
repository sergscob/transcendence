import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { toast } from 'react-toastify'
import { useSettingsStore } from "@/stores/settingsStore";

const API = axios.create({
  baseURL: ""
});

API.interceptors.request.use(config => {
  const serverIP = useSettingsStore.getState().serverIP;
  config.baseURL = `http://${serverIP}/api/`;
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