import BigButton from "@/components/ui_int/BigButton";
import { useTranslation } from 'react-i18next';


export default function Index() {
  const { t, i18n } = useTranslation();

  return (
    <div className="w-90 flex flex-col justify-center gap-5">
        {/* <BigButton text="Main page" url="/" className="bg-red-500 hover:bg-red-700 border-red-700"/> */}
        <BigButton text={t('main_menu.edit_profile')} url="/editprofile" className="bg-purple-300 hover:bg-blue-700 border-blue-700"/>
        <BigButton text={t('main_menu.friends')} url="/editfriends" className="bg-purple-400 hover:bg-blue-700 border-blue-700"/>
        <BigButton text={t('main_menu.settings')} url="/settings" className="bg-purple-500 hover:bg-blue-700 border-blue-700"/>
        <BigButton text={t('main_menu.start_game')} url="/game" className="bg-purple-600 hover:bg-blue-700 border-blue-700"/>
		    <BigButton text={t('main_menu.open_matches')} url="/matches" className="bg-yellow-500 hover:bg-yellow-700 border-yellow-700"/>
        <BigButton text={t('main_menu.statistics')} url="/stat" className="bg-yellow-500 hover:bg-yellow-700 border-yellow-700"/>
    </div>
  );
}
