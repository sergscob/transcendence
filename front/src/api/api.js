import axios from "axios";
import { getToken, logout } from "../utils/auth";
import React from 'react';
import { toast } from 'react-toastify'
import { useSettingsStore } from "@/stores/settingsStore";

const serverIP = useSettingsStore.getState().serverIP;
console.log("serverIP from store:", serverIP);

const API = axios.create({
  baseURL: `http://${serverIP}/api/`
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