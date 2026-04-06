import { useEffect, useState } from "react";
import API from "../api/api";
import { useUserStore } from "@/stores/userStore";
import FriendInfo from "../components/ui_int/FriendInfo";
import addFriendIcon from "../assets/icons/addFriend.svg";
import Loading from "../components/ui_int/Loading";
import NotFound from "./NotFound";
import { useTranslation } from "react-i18next";

function EditFriends() {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);
  const loaded = useUserStore((s) => s.loaded);
  const loading = useUserStore((s) => s.loading);
  const [allFriends, setAllFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [waitingList, setWaitingList] = useState([]);

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

  if (loading) return <Loading />;
  if (!user) return <NotFound text={t("edit_friends.server_connection_error")} code={t("edit_friends.error_code")} />;

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-fuchsia-200">
      <div className="flex gap-30">

        <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-white">
          <h2 className="mr-10 text-lg font-bold text-[40px]">{t("edit_friends.all_users")}</h2>
            <input
                className="placeholder:text-gray-500 placeholder:italic rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("edit_friends.search_user")} type="text" name="search"
            />
            <ul className="overscroll-auto max-h-64 overflow-y-auto p-4 space-y-8 border border-gray-300 rounded-md">
            {allFriends.map(friend => (
                <li key={friend.id}>
				<div className="flex justify-between items-center border-b border-gray-300 pb-2">
					<FriendInfo friend={friend} className="my-2 text-[20px] gap-3"/>
					<div>
    						{friend.accepted ? <span className="text-xs text-red-600"> {t("edit_friends.accepted_error")}</span> : ''}
						{friend.invitation_sent ?
							<span>
    							<span className="text-xs text-green-600"> {t("edit_friends.invitation_sent")} </span>
							<a className="text-xs text-red-400" onClick={() => deleteInvitation(friend.id)}>
    								{t("edit_friends.delete_invitation")}
							</a>
							</span>
    						: <a title={t("edit_friends.send_friend_request")} onClick={() => sendInvitation(friend.id)}>
    							<img src={addFriendIcon} alt={t("edit_friends.send_friend_request")} width="30" height="30"/>
							</a>
						}
					</div>
                </div>
				</li>
            ))}
            </ul>
        </div>

        <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-white">
          <h2 className="text-lg text-[40px] font-bold">{t("edit_friends.friends")}</h2>
            {friends.length ?
            <ul>
                {friends.map(friend => (
                <li key={friend.id}>
                    <FriendInfo friend={friend} className="my-2">
                        <a className="text-xs text-red-400 pl-2" onClick={() => deleteInvitation(friend.id)}>
                  {t("edit_friends.delete_friend")}
                        </a>
                    </FriendInfo>
                </li>
                ))}
            </ul>
          : <div>{t("edit_friends.add_some_friends")}</div>}
          <h2 className="text-lg font-bold">{t("edit_friends.waiting_for_approval")}</h2>
            {waitingList.length ?
            <ul>
                {waitingList.map(friend => (
                <li key={friend.id}>
                    <FriendInfo friend={friend} className="my-2">
                    <a className="text-xs text-green-600" onClick={() => acceptInvitation(friend.id)}>
                {t("edit_friends.accept_invitation")}
                    </a>
                    </FriendInfo>
                </li>
                ))}
            </ul>
          : <div>{t("edit_friends.friendship_requests_here")}</div>
            }
        </div>
      </div>
    </div>
  );
}

export default EditFriends;
