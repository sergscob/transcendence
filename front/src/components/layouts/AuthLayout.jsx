import { Outlet, Link } from "react-router-dom";
import LangSwitcher from "@/components/common/LangSwitcher"
import { useTranslation } from 'react-i18next';
import Footer from "../common/Footer";
import { toast } from 'react-toastify'
import backgroundImage from "@/assets/images/brick-bg.jpg";

export default function AuthLayout() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }}>
		<div className="min-h-screen flex items-center justify-center">
			<div className="absolute top-[10px] left-[10px] text-white">Transendance</div>
			<div className="absolute top-[10px] right-[10px] flex items-end flex-col">
				<LangSwitcher />
				<Link className="text-white" to="/settings-start">{t('main_menu.settings')}</Link>

			</div>
			<Outlet />
			<Footer />
		</div>
	</div>
  );
}
