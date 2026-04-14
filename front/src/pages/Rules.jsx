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
        <div className="w-full min-h-screen flex justify-center items-center py-10 px-4">
            
            <div className="flex flex-col gap-6 w-full max-w-4xl border border-gray-600 rounded-xl p-6 md:p-10 shadow-2xl bg-gray-800">

                <h2 className="font-extrabold text-3xl md:text-5xl text-white text-center tracking-wide mb-2">
                    {t("main_menu.game_rules")}
                </h2>

                <div className="flex flex-col gap-3 text-gray-200 text-base md:text-lg bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-inner">
                    <h3 className="text-xl md:text-2xl font-bold text-blue-400 border-b border-gray-500 pb-2">
                        1. {t("rules.objective")}
                    </h3>
                    <p className="leading-relaxed">
                        {t("rules.objective_content")}
                    </p>
                </div>

                <div className="flex flex-col gap-3 text-gray-200 text-base md:text-lg bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-inner">
                    <h3 className="text-xl md:text-2xl font-bold text-green-400 border-b border-gray-500 pb-2">
                        2. {t("rules.loadout")}
                    </h3>
                    <ul className="space-y-4">
                        <li>
                            <strong className="text-green-300 uppercase tracking-wider text-sm mr-2">{t("rules.loadout_lives_title")} :</strong> 
                            <span className="text-gray-300">{t("rules.loadout_lives_content")}</span>
                        </li> 
                        <li>
                            <strong className="text-green-300 uppercase tracking-wider text-sm mr-2">{t("rules.loadout_ammo_title")} :</strong> 
                            <span className="text-gray-300">{t("rules.loadout_ammo_content")}</span>
                        </li> 
                        <li>
                            <strong className="text-green-300 uppercase tracking-wider text-sm mr-2">{t("rules.loadout_lobby_title")} :</strong> 
                            <span className="text-gray-300">{t("rules.loadout_lobby_content")}</span>
                        </li> 
                    </ul>
                </div>

                <div className="flex flex-col gap-3 text-gray-200 text-base md:text-lg bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-inner">
                    <h3 className="text-xl md:text-2xl font-bold text-yellow-400 border-b border-gray-500 pb-2">
                        3. {t("rules.controls")}
                    </h3>
                    <ul className="space-y-4">
                        <li>
                            <strong className="text-yellow-300 uppercase tracking-wider text-sm mr-2">{t("rules.controls_wasd")} :</strong> 
                            <span className="text-gray-300">{t("rules.controls_movements")}</span>
                        </li> 
                        <li>
                            <strong className="text-yellow-300 uppercase tracking-wider text-sm mr-2">{t("rules.controls_spacebar")} :</strong> 
                            <span className="text-gray-300">{t("rules.controls_jump")}</span>
                        </li> 
                        <li>
                            <strong className="text-yellow-300 uppercase tracking-wider text-sm mr-2">{t("rules.controls_leftclick")} :</strong> 
                            <span className="text-gray-300">{t("rules.controls_shoot")}</span>
                        </li> 
                    </ul>
                </div>

                <div className="flex flex-col gap-3 text-gray-200 text-base md:text-lg bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-inner">
                    <h3 className="text-xl md:text-2xl font-bold text-purple-400 border-b border-gray-500 pb-2">
                        4. {t("rules.multiplayer")}
                    </h3>
                    <ul className="space-y-4">
                        <li>
                            <strong className="text-purple-300 uppercase tracking-wider text-sm mr-2">{t("rules.multiplayer_serversetup")} :</strong> 
                            <span className="text-gray-300">{t("rules.multiplayer_serversetup_content")}</span>
                        </li> 
                        <li>
                            <strong className="text-purple-300 uppercase tracking-wider text-sm mr-2">{t("rules.multiplayer_createroom")} :</strong> 
                            <span className="text-gray-300">{t("rules.multiplayer_createroom_content")}</span>
                        </li> 
                        <li>
                            <strong className="text-purple-300 uppercase tracking-wider text-sm mr-2">{t("rules.multiplayer_joinmatch")} :</strong> 
                            <span className="text-gray-300">{t("rules.multiplayer_joinmatch_content")}</span>
                        </li> 
                        <li>
                            <strong className="text-purple-300 uppercase tracking-wider text-sm mr-2">{t("rules.multiplayer_startgame")} :</strong> 
                            <span className="text-gray-300">{t("rules.multiplayer_startgame_content")}</span>
                        </li> 
                    </ul>
                </div>

            </div>
        </div>
    );
}