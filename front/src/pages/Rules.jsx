import { useTranslation } from "react-i18next";
import { useUserStore } from "@/stores/userStore";
import Loading from "../components/ui_int/Loading";
import NotFound from "./NotFound";

export default function Rules() {
	const { t } = useTranslation();

	const user = useUserStore((s) => s.user);
	const loading = useUserStore((s) => s.loading);

	if (loading) return <Loading />;
	if (!user) {
		return (
			<NotFound
				text={t("rules.server_connection_error")}
				code={t("rules.error_code")}
			/>
		);
	}
	return (
		<div className="w-screen min-h-screen flex justify-center items-center">
			<div className="flex flex-col md:flex-row gap-10 lg:gap-20 relative ">
				<div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-gray-500 min-w-150 min-h-100 p-5">

					<h2 className="mr-10 text-lg font-bold text-[40px] text-white text-center">{t("main_menu.game_rules")}</h2>

					<div className="flex flex-col gap-4 text-white text-lg bg-gray-600 p-6 rounded-md border border-gray-300">
						<h3 className="flex flex-col text-center">{t("rules.objective")}</h3>
						{t("rules.objective_content")}
					</div>
					<div className="flex flex-col gap-4 text-white text-lg bg-gray-600 p-6 rounded-md border border-gray-300">
						<h3 className="flex flex-col text-center">{t("rules.loadout")}</h3>
						<ul>
							<li>- {t("rules.loadout_lives_title")} : {t("rules.loadout_lives_content")}</li> 
							<li>- {t("rules.loadout_ammo_title")} : {t("rules.loadout_ammo_content")}</li> 
							<li>- {t("rules.loadout_lobby_title")} : {t("rules.loadout_lobby_content")}</li> 
						</ul>
					</div>
					<div className="flex flex-col gap-4 text-white text-lg bg-gray-600 p-6 rounded-md border border-gray-300">
						<h3 className="flex flex-col text-center">{t("rules.controls")}</h3>
						<ul>
							<li>- {t("rules.controls_wasd")} : {t("rules.controls_movements")}</li> 
							<li>- {t("rules.controls_spacebar")} : {t("rules.controls_jump")}</li> 
							<li>- {t("rules.controls_leftclick")} : {t("rules.controls_shoot")}</li> 
						</ul>
					</div>
					<div className="flex flex-col gap-4 text-white text-lg bg-gray-600 p-6 rounded-md border border-gray-300">
						<h3 className="flex flex-col text-center">{t("rules.multiplayer")}</h3>
						<ul>
							<li>- {t("rules.multiplayer_serversetup")} : {t("rules.multiplayer_serversetup_content")}</li> 
							<li>- {t("rules.multiplayer_createroom")} : {t("rules.multiplayer_createroom_content")}</li> 
							<li>- {t("rules.multiplayer_joinmatch")} : {t("rules.multiplayer_joinmatch_content")}</li> 
							<li>- {t("rules.multiplayer_startgame")} : {t("rules.multiplayer_startgame_content")}</li> 
						</ul>
					</div>

				</div>
			</div>
		</div>
	);
}