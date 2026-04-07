import { useEffect, useState } from "react";
import API from "../api/api";
import Avatar from "@/components/ui_int/Avatar";
import { useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { useTranslation } from "react-i18next";
import Rain from "../components/ui/rain.tsx";

function ViewProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [ user, setUser ] = useState(null);
  const [ loading, setLoading ] = useState(true);

  const loadUser = async () => {
        try {
            const res = await API.get(`profile/${id}/`);
            setUser(res.data);
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
	<div className="relative w-screen h-screen flex justify-center items-center">
		<Rain className="absolute inset-0 -z-10" />
		<div className="flex flex-col gap-10 relative z-10 items-center border border-black rounded-lg p-10 shadow-lg bg-gray-500">
			<Avatar user={user} size="250" />
			<div className="text-[30px] font-bold text-white">{user.username}</div>
		</div>
	</div>
  );
}

export default ViewProfile;
