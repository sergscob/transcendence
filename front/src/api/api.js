import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { toast } from 'react-toastify'
import { useSettingsStore } from "@/stores/settingsStore";

const API = axios.create({
  baseURL: ""
});

API.interceptors.request.use(config => {
  const serverHttpUrl = useSettingsStore.getState().getServerHttpUrl();
  const lang = useSettingsStore.getState().language;

  // config.baseURL = `${serverHttpUrl}/api/`;
  config.baseURL = `/api/`;
  const token = getToken();
  if (token) 
    config.headers.Authorization = `Bearer ${token}`;
  if (lang)
    config.headers["Accept-Language"] = lang;

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