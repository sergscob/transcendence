import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

export default function RedirectToDjangoAdmin() {
  const serverIP = useSettingsStore.getState().serverIP;

  useEffect(() => {
    window.location.replace(`http://${serverIP}/admin/`);
  }, []);
  return null;
}
