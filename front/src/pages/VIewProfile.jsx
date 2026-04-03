import { useEffect, useState } from "react";
import API from "../api/api";
import Avatar from "@/components/ui_int/Avatar";
import { useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";

function ViewProfile() {
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

  if (loading ) return <div>Loading...</div>;
  if (!user) return <NotFound text="User not found" />;


  return (
    <div>
      <Avatar user={user} size="20" />
      <div>{user.username}</div>
    </div>
  );
}

export default ViewProfile;