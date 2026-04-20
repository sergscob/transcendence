import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import API from "../api/api";
import Avatar from "@/components/ui_int/Avatar";
import NotFound from "@/pages/NotFound";
import ButtonClose from "@/components/ui_int/ButtonClose";

function ViewProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [ user, setUser ] = useState(null);
  const [ stat, setStat ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const navigate = useNavigate();

  const loadUser = async () => {
        try {
            let res = await API.get(`profile/${id}/`);
            setUser(res.data);
            res = await API.get(`stats/${id}/`);
            setStat(res.data);
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
			<div className="flex flex-col items-center gap-3">
				<Avatar user={user} size="300" />
				<div className="text-[30px] font-bold text-white">{user.username}</div>
			</div>
			<div className="flex flex-col items-left">
				<div className="">
					{t("view_profile.email")}: {user.email}
				</div>
				<div className="">
					{t("view_profile.place")}: {stat?.place || 0}
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
				<Link to={`/usermatches/${id}`} className="text-emerald-300 hover:underline">
					{t("view_profile.view_matches")}
				</Link>
			</div>
		</div>
	</div>
  );
}

export default ViewProfile;
