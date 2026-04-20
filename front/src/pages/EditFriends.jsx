import { useEffect, useState } from "react";
import API from "../api/api";
import { useUserStore } from "@/stores/userStore";
import FriendInfo from "../components/ui_int/FriendInfo";
import AddFriendIcon from "../assets/icons/addFriend.svg?react";
import WaitApprouveIcon from "../assets/icons/waitApprouvalFriend.svg?react";
import CancelRequestIcon from "../assets/icons/cancelFriendRequest.svg?react";
import AcceptFriendIcon from "../assets/icons/acceptFriend.svg?react";
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
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchAllData() {
    await Promise.all([
      API.get("friends/search/").then(res => setAllFriends(res.data)),
      API.get("friends/").then(res => setFriends(res.data)),
      API.get("friends/?waiting=1").then(res => setWaitingList(res.data)),
    ]);
  }

  useEffect(() => {
    if (loaded && user) {
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
    <div className="w-screen min-h-screen flex justify-center items-center">
      <div className="flex flex-col md:flex-row gap-10 lg:gap-20 relative ">

        <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-gray-500 min-w-150 min-h-100 p-5">
          <h2 className="mr-10 text-lg font-bold text-[40px] text-white">{t("edit_friends.all_users")}</h2>
            <input
                className="placeholder:text-white p-1 text-white placeholder:italic rounded-md bg-gray-600 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            	placeholder={t("edit_friends.search_user")} type="text" value={searchQuery}
				onChange={e => setSearchQuery(e.target.value)}
            />

            <ul className="overscroll-auto max-h-64 overflow-y-auto p-4 space-y-4 border border-gray-300 rounded-md bg-gray-600">
            {allFriends
			.filter(friend => (searchQuery === "") ? true : friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
			.map(friend => (
                <li key={friend.id}>
				<div className="flex justify-between items-center border border-gray-300 rounded-md p-2 bg-gray-600">
					<FriendInfo friend={friend} className="my-2 text-[25px] gap-3 text-white"/>
					<div>
    					{friend.accepted ? <span className="text-xs text-red-600"> {t("edit_friends.accepted_error")}</span> : ''}
						{friend.invitation_sent ?
							<span className="flex items-center gap-2">
								<a title={t("edit_friends.delete_invitation")} onClick={() => deleteInvitation(friend.id)}>
									<CancelRequestIcon className="w-7 h-7 fill-red-500"/>
								</a>
								<a title={t("edit_friends.invitation_sent")}>
									<WaitApprouveIcon className="w-7 h-7 stroke-yellow-500"/>
								</a>
							</span>
    						: <a title={t("edit_friends.send_friend_request")} onClick={() => sendInvitation(friend.id)}>
                  				<AddFriendIcon className="w-7 h-7 stroke-green-500 " />
							</a>
						}
					</div>
                </div>
				</li>
            ))}
            </ul>
        </div>

        <div className="flex flex-col gap-4 border border-black rounded-md p-4 shadow-lg bg-gray-500">
          <h2 className="text-lg text-[40px] font-bold text-white">{t("edit_friends.friends")}</h2>
            {friends.length ?
            <ul className="overflow-y-auto border rounded-md bg-gray-600 border-gray-300 p-4 space-y-4">
                {friends.map(friend => (
                <li key={friend.id}>
					<div className="flex justify-between items-center border border-gray-300 rounded-md p-2 bg-gray-600">
						<FriendInfo friend={friend} className="text-[25px] text-white gap-3"> </FriendInfo>
						<a className="cursor-pointer" title={t("edit_friends.delete_friend")} onClick={() => deleteInvitation(friend.id)}>
								<CancelRequestIcon className="w-7 h-7 fill-red-500" />
						</a>
					</div>
				</li>
                ))}
            </ul>
          : <div className="text-white">{t("edit_friends.add_some_friends")}</div>}
          <h2 className="text-lg text-white text-[20px]">{t("edit_friends.waiting_for_approval")}</h2>
            {waitingList.length ?
            <ul className="overflow-y-auto border rounded-md bg-gray-600 border-gray-300 p-4 space-y-4">
                {waitingList.map(friend => (
                <li key={friend.id}>
					<div className="flex justify-between items-center border border-gray-300 rounded-md p-2 bg-gray-600">
						<FriendInfo friend={friend} className="text-[25px] text-white gap-3"> </FriendInfo>
						<a className="cursor-pointer" title={t("edit_friends.accept_invitation")} onClick={() => acceptInvitation(friend.id)}>
							<AcceptFriendIcon className="w-7 h-7 stroke-green-500" />
						</a>
					</div>
                </li>
                ))}
            </ul>
          : <div className="text-white">{t("edit_friends.friendship_requests_here")}</div>
            }
        </div>
      </div>
    </div>
  );
}

export default EditFriends;
