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
						
						<p>
							<strong className="flex flex-col">Objective</strong>The objective of the game is to eliminate all other players
						</p>
						<p>
							<strong className="flex flex-col">Controls</strong>Use WASD to move, Space to jump and Left Click to shoot
						</p>
						
					</div>

				</div>
			</div>
		</div>
	);
}