import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify'
import { useSettingsStore } from "@/stores/settingsStore.ts";
import { useTranslation } from 'react-i18next';

import Input from "../components/ui_int/Input";
import Button from "../components/ui_int/Button";
import ButtonClose from "../components/ui_int/ButtonClose";


function RestorePassword() {
  const { serverIP, setServerIp } = useSettingsStore();
  const [form, setForm] = useState({ ip: serverIP });
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  async function changeForm(ip) {
    setForm({...form, ip})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerIp(form.ip)
    toast.success(t("settings.ip_address.updated"));
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-500 p-6 rounded-2xl shadow-lg w-150 relative border border-black"
      >
        {/* { location.pathname == "/settings-start" && */}
          <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" /> 
        {/* } */}

        <h2 className="text-xl text-white mb-4 _text-center">{t("settings.ip_address.title")}</h2>
        <Input
            value={form.ip}
            onChange={e => changeForm(e.target.value)}
			      className="border border-gray-300 bg-gray-600 text-white"
        />
        <Button disabled={form.ip === serverIP} className="mt-6 border text-white hover:bg-gray-500 cursor-pointer border-gray-300">{t("settings.save")}</Button>
      </form>
    </div>
  );
}

export default RestorePassword;
