import { useEffect, useRef, useState } from 'react'
import { useSettingsStore } from "@/stores/settingsStore.ts";
import Input from "../components/ui_int/Input";
import Button from "../components/ui_int/Button";


function RestorePassword() {
  const { serverIP, setServerIp } = useSettingsStore();
  const [form, setForm] = useState({ ip: serverIP });

  async function changeForm(ip) {
    setForm({...form, ip})
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerIp(form.ip)
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      {JSON.stringify(form)}
      <form 
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-100"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Game server IP address</h2>
        <Input
            value={form.ip}
            onChange={e => changeForm(e.target.value)}
            placeholder="Server IP"
        />
        <Button disabled={form.ip === serverIP} className="mt-2">Save</Button>
      </form>
    </div>
  );
}

export default RestorePassword;