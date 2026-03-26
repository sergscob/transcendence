import { useEffect } from "react";

export default function OAuth() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/";
    }
  }, []);

  return <div>Logging in...</div>;
}