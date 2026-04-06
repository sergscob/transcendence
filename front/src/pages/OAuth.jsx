import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function OAuth() {
  const { t } = useTranslation();
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

  return <div>{t("oauth.logging_in")}</div>;
}