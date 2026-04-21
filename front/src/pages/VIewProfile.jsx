import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import API from "../api/api";
import ShortProfile from "@/components/common/ShortProfile";
import NotFound from "@/pages/NotFound";
import ButtonClose from "@/components/ui_int/ButtonClose";


function ViewProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [ user, setUser ] = useState(null);
  const [ stat, setStat ] = useState(null);
  const [ nextMilestone, setNextMilestone ] = useState(0);
  const [ loading, setLoading ] = useState(true);
  const navigate = useNavigate();

  const loadUser = async () => {
        try {
			const userRes = await API.get(`profile/${id}/`);
			setUser(userRes.data);

			const statsRes = await API.get(`stats/${id}/`);
			const statsData = statsRes.data;
			setStat(statsData);

			const milestonesRes = await API.get(`milestones/`);
			const milestones = milestonesRes.data;
			const currentMilestone = milestones.findIndex((m) => m.level === statsData.level);
			if (currentMilestone > 0) 
				setNextMilestone(milestones[currentMilestone-1].score)

        } catch (err) {
            console.error("Error loading user profile:", err);
        }
        setLoading(false);
   }

  useEffect(() => {
    loadUser();
  }, []);

  if (loading ) return <div>{t("view_profile.loading")}</div>;
  if (!user) return <NotFound text={t("view_profile.user_not_found")} />;

  return (
	<div className="w-screen h-screen flex justify-center items-center">
		<div className="flex flex-col gap-2 border text-white border-black rounded-lg p-10 shadow-lg bg-gray-500 relative" >
		   <ButtonClose onClose={() => navigate(-1)} className="absolute top-4 right-4" /> 

			<ShortProfile user={user} avatarSize="250" stat={stat} nextMilestone={nextMilestone} />
			
			<div className="flex flex-col items-left mt-4">
				<div className="">
					{t("view_profile.email")}: {user.email}
				</div>
				<div className="">
					{t("view_profile.total_matches")}: {stat?.total_matches || 0}
				</div>
				<div className="">
					{t("view_profile.wins")}: {stat?.wins || 0}
				</div>
				<div className="">
					{t("view_profile.losses")}: {stat?.losses || 0}
				</div>
				<div className="">
					{t("view_profile.score")}: {stat?.score || 0}
				</div>
				<Link to={`/usermatches/${id}`} className="text-white hover:underline mt-2 bg-emerald-400 px-2 py-1 rounded text-center">
					{t("view_profile.view_matches")}
				</Link>
			</div>
		</div>
	</div>
  );
}

export default ViewProfile;
