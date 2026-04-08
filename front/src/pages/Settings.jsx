import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify'
import { useSettingsStore } from "@/stores/settingsStore.ts";
import { useTranslation } from 'react-i18next';
import Rain from "../components/ui/rain.tsx";

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
    <div className="relative flex h-screen items-center justify-center bg-gray-100">
      <Rain className="absolute inset-0 -z-10" />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-120 relative"
      >
        { location.pathname == "/settings-start" &&
          <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" /> }

        <h2 className="text-xl font-bold mb-4 text-center">{t("settings.ip_address.title")}</h2>
        <Input
            value={form.ip}
            onChange={e => changeForm(e.target.value)}
        />
        <Button disabled={form.ip === serverIP} className="mt-6">{t("settings.save")}</Button>
      </form>
    </div>
  );
}

export default RestorePassword;
