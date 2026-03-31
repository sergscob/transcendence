import { useEffect, useState, useRef } from "react";
import API from "../api/api";
import { useUserStore } from "@/stores/userStore";
import { IMAGES_DIR } from "/config";
import FriendInfo from "../components/ui/FriendInfo";

function Profile() {
  const loadUser = useUserStore((s) => s.loadUser);
  const user = useUserStore((s) => s.user);
  const loading = useUserStore((s) => s.loading);
  const loaded = useUserStore((s) => s.loaded);
  const [allFriends, setAllFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const fileInputRef = useRef();

  async function fetchAllData() {
    await Promise.all([
      API.get("friends/search/").then(res => setAllFriends(res.data)),
      API.get("friends/").then(res => setFriends(res.data)),
      API.get("friends/?waiting=1").then(res => setWaitingList(res.data)),
    ]);
  }

  useEffect(() => {
    if (loaded && user) {
      console.log("User loaded in Profile.jsx", user);
      fetchAllData();
    }
  }, [user]);

  async function uploadAvatar(e) {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await API.patch("profile/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadUser(true);
      fileInputRef.current.value = "";
    } catch (err) {
      alert("Failed to upload avatar");
    }
  }

  async function sendInvitation(friendId) {
    await API.post("friends/", { friend_id: friendId });
    await fetchAllData();
  }

  async function deleteInvitation(friendId) {
    await API.delete("friends/" + friendId + "/");
    await fetchAllData();
  }

  async function acceptInvitation(friendId) {
    await API.patch("friends/" + friendId + "/", { accepted: true });
    await fetchAllData();
  }

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div>
      <div>{user.username}</div>
      {user.avatar && (
          <img src={IMAGES_DIR+user.avatar} className="w-15 h-15 rounded-full" />
      )}
      <form onSubmit={uploadAvatar} className="ma-4 border-2 p-4 rounded">
        <input type="file" accept="image/*" ref={fileInputRef} />
        <button type="submit">Upload Avatar</button>
      </form>
      <h2 className="text-lg font-bold">All Friends:</h2>
      <ul>
        {allFriends.map(friend => (
          <li key={friend.id}>
            <FriendInfo friend={friend} className="my-2">
              {friend.accepted ? <span className="text-xs text-red-600"> ERROR! accepted</span> : ''}
              {friend.invitation_sent ? 
                  <span>
                    <span className="text-xs text-green-600"> invitation sent </span> 
                    <a className="text-xs text-red-400" onClick={() => deleteInvitation(friend.id)}> 
                      delete invitation
                    </a>
                  </span>
                : <a className="pl-2 text-xs text-amber-800" onClick={() => sendInvitation(friend.id)}> 
                    send request
                  </a>
              }
            </FriendInfo>
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-bold">Friends:</h2>
      {friends.length ? 
        <ul>
          {friends.map(friend => (
            <li key={friend.id}>
              <FriendInfo friend={friend} className="my-2">
                  <a className="text-xs text-red-400 pl-2" onClick={() => deleteInvitation(friend.id)}> 
                      delete friend
                  </a>
                </FriendInfo>
            </li>
          ))}
        </ul>
        : <div>No friends</div>}
      <h2 className="text-lg font-bold">Waiting for Approval:</h2>
      {waitingList.length ?  
        <ul>
          {waitingList.map(friend => (
            <li key={friend.id}>
              <FriendInfo friend={friend} className="my-2">
                <a className="text-xs text-green-600" onClick={() => acceptInvitation(friend.id)}>
                  accept invitation
                </a>
              </FriendInfo>
            </li>
          ))}
        </ul>
        : <div>Nobody wants to be your friend</div>
      }
    </div>
  );
}

export default Profile;