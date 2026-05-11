import axios from "axios";
import { getRefreshToken, getToken, logout, setTokens } from "../utils/auth";
import { toast } from 'react-toastify'
import { useSettingsStore } from "@/stores/settingsStore";

const API = axios.create({
  baseURL: import.meta.env.VITE_USE_HTTPS ? "" : "http://localhost:8000"
});

let refreshRequest = null;

async function refreshAccessToken() {
  if (!refreshRequest) {
    const currentRefresh = getRefreshToken();
    if (!currentRefresh) {
      throw new Error("No refresh token found");
    }

    refreshRequest = API.post(
      "/auth/refresh/",
      { refresh: currentRefresh },
      { _isRefreshRequest: true }
    )
      .then((res) => {
        const nextAccess = res.data?.access;
        const nextRefresh = res.data?.refresh || currentRefresh;
        if (!nextAccess) {
          throw new Error("No access token returned from refresh");
        }
        setTokens({ access: nextAccess, refresh: nextRefresh });
        return nextAccess;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

API.interceptors.request.use(config => {
  const lang = useSettingsStore.getState().language;

  config.baseURL = import.meta.env.VITE_USE_HTTPS ? "/api/" : "http://localhost:8000/api/";
  const token = getToken();
  if (token) 
    config.headers.Authorization = `Bearer ${token}`;
  if (lang)
    config.headers["Accept-Language"] = lang;

  return config;
});

API.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config || {};
    const isUnauthorized = err.response?.status === 401;
    const isRefreshRequest = originalRequest._isRefreshRequest;

    if (!isUnauthorized || isRefreshRequest || originalRequest._retry) {
      if (isUnauthorized && isRefreshRequest) logout();
      return Promise.reject(err);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return API(originalRequest);
    } catch (_refreshError) {
      logout();
      return Promise.reject(err);
    }
  }
);

export default API;