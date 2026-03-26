import { useEffect } from "react";

export default function RedirectToDjangoAdmin() {
  useEffect(() => {
    window.location.replace("http://localhost:8000/admin/");
  }, []);
  return null;
}
