import i18n from "../i18n";

export function getAchivmentMessage(payload) {
    const code = payload?.code;

    if (code === "level_up") 
        return i18n.t("achievements.level_up", { level: payload?.level ?? "?" });

    if (code === "first_win") 
        return i18n.t("achievements.first_win");

    return i18n.t("achievements.unknown");
}