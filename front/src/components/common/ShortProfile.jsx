import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Avatar from "@/components/ui_int/Avatar";
import ProgressBar from "@/components/ui_int/ProgressBar";
import { elipsys } from "@/utils/showUtils";


function ShortProfile({ user, avatarSize, stat, nextMilestone=0, className }) {

  const { t } = useTranslation();

  const normalizedLevel = Math.max(1, Math.min(10, stat?.level || 10));
  const rankLabel = t(`view_profile.rank_${normalizedLevel}`);

  return (
    <div className={`flex flex-col items-center gap-1 ${className || ''}`}>
        <Avatar user={user} size={avatarSize} />
        <div
            className="w-full text-center h-8 text-[24px] text-white shrink-0 overflow-hidden"
            title={user?.username}
        >
            {elipsys(user?.username)}
        </div>
        <div className="w-full max-w-72 space-y-2">
            <div className="text-center text-white">
                {t("total_stat.level")}: {stat?.level || 0}/10
            </div>
            <div className="text-center text-sm text-emerald-300 ">
                {t("view_profile.rank")}: {rankLabel}
            </div>
            <ProgressBar value={10 - stat?.level || 0} max={10} />
            {
                nextMilestone > 0 && (
                    <div className="text-center text-xs text-white/80">
                        {t("view_profile.next_milestone")}: {nextMilestone} 
                    </div>
                )
            }
            <div className="text-center text-lg text-white/80">
                {t("view_profile.place")}: {stat?.place || 0}
            </div>
        </div>
    </div>
  );
}

export default ShortProfile;
