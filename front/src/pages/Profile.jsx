import { useEffect, useState } from "react";
import API from "../api/api";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    API.get("profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(res => setUser(res.data));
  }, []);

  if (!user) return <div>Loading...</div>;

  return <div>{user.username}</div>;
}

export default Profile;