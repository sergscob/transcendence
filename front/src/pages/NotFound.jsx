import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Rain from "../components/ui/rain.tsx";

export default function NotFound({ text, code=404 }) {
  const { t } = useTranslation();
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-50">
      <Rain className="absolute inset-0 -z-10"/>
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold text-white mb-4">{code}</h1>
        <p className="text-2xl text-white mb-8">{text || t("not_found.page_not_found")}</p>
        <Link to="/" className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
          {t("not_found.to_main_page")}
        </Link>
      </div>
    </div>
  );
}
