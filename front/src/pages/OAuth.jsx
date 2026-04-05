import { useEffect } from "react";

export default function OAuth() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      window.location.href = "/login";
      return;
    }

    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/";
      return;
    }

    window.location.href = "/login";
  }, []);

  return <div>Logging in...</div>;
}