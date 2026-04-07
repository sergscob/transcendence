import { Outlet, Link } from "react-router-dom";
import LangSwitcher from "@/components/common/LangSwitcher"
import { useTranslation } from 'react-i18next';
import Footer from "../common/Footer";

export default function AuthLayout() {
  const { t, i18n } = useTranslation();

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="absolute top-[10px] left-[10px]">Transendance</div>
        <div className="absolute top-[10px] right-[10px] flex items-end flex-col">
          <LangSwitcher />
          <Link to="/settings-start">{t('main_menu.settings')}</Link>
        
        </div>
        <Outlet />
        <Footer />
    </div>
    </>
  );
}