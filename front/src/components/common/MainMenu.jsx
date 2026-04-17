import BigButton from "@/components/ui_int/BigButton";
import { useTranslation } from 'react-i18next';


export default function Index() {
  const { t, i18n } = useTranslation();

  return (
    <div className="w-90 flex flex-col justify-center gap-5">
        {/* <BigButton text="Main page" url="/" className="bg-red-500 hover:bg-red-700 border-red-700"/> */}
        <BigButton text={t('main_menu.edit_profile')} url="/editprofile" className="bg-blue-500 hover:bg-red-700 border-black"/>
        <BigButton text={t('main_menu.friends')} url="/editfriends" className="bg-blue-600 hover:bg-red-700 border-black"/>
        <BigButton text={t('main_menu.settings')} url="/settings" className="bg-blue-800 hover:bg-red-700 border-black"/>
        {/* <BigButton text={t('main_menu.start_game')} url="/game" className="bg-purple-700 hover:bg-red-700 border-black"/> */}
        <BigButton text={t('main_menu.open_matches')} url="/matches" className="bg-purple-600 hover:bg-red-700 border-black"/>
        <BigButton text={t('main_menu.statistics')} url="/stats" className="bg-purple-500 hover:bg-red-700 border-black"/>
		<BigButton text={t('main_menu.game_rules')} url="/rules" className="bg-purple-400 hover:bg-red-700 border-black"/>
	</div>
  );
}
