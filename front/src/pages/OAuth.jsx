import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function OAuth() {
  const { t } = useTranslation();
  const [status, setStatus] = useState({ kind: "loading", message: t("oauth.logging_in") });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      const messageKey =
        error === "e42_token_exchange_failed"
          ? "oauth.error_e42_token_exchange_failed"
          : "oauth.error_default";

      setStatus({ kind: "error", message: t(messageKey) });
      const timeoutId = window.setTimeout(() => {
        window.location.href = "/login";
      }, 30000);

      return () => window.clearTimeout(timeoutId);
    }

    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/";
      return;
    }

    window.location.href = "/login";
  }, [t]);

  return (
    <div className="bg-red-400 text-white p-10 rounded-2xl">
      {status.message}<br/>
      <Link to="/login">Login</Link>
    </div>
  );
}