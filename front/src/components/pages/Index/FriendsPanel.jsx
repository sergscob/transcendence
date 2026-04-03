import { useEffect, useState } from "react";
import API from "@/api/api";
import { useUserStore } from "@/stores/userStore";
import FriendInfo from "@/components/ui_int/FriendInfo";
import DraggableWindow from "@/components/ui_int/DraggableWindow";
import ChatWindow from "@/components/chat/ChatWindow";
import { Link } from "react-router-dom";
import IconChat from "@/assets/icons/chat.svg?react";

function FriendsPanel() {
  const user = useUserStore((s) => s.user);
  const loaded = useUserStore((s) => s.loaded);
  const [friends, setFriends] = useState([]);
  const [openChats, setOpenChats] = useState([]);

  async function fetchAllData() {
    await Promise.all([
      API.get("friends/").then(res => setFriends(res.data)),
    ]);
  }

  useEffect(() => {
    if (loaded && user) {
      fetchAllData();
    }
  }, [user]);

  function getRoomName(friendId) {
    const ids = [String(user.id), String(friendId)].sort();
    return `chat_${ids[0]}_${ids[1]}`;
  }

  function openChat(friend) {
    setOpenChats((currentChats) => {
      if (currentChats.some((chat) => chat.id === friend.id)) {
        return currentChats;
      }

      return [...currentChats, friend];
    });
  }

  function closeChat(friendId) {
    setOpenChats((currentChats) => currentChats.filter((chat) => chat.id !== friendId));
  }

  if (!user) return (<>loading</>)

  return (
    <>
      <DraggableWindow
        title="Friends"
        defaultPosition={{ x: 40, y: 120 }}
        headerClassName="bg-amber-50"
        className="w-[320px] max-w-[calc(100vw-2rem)]"
        bodyClassName="max-h-[60vh] overflow-y-auto bg-amber-20 px-3 py-2"
      >
        {friends.length ? (
          <ul>
            {friends.map((friend) => (
              <li key={friend.id}>
                <FriendInfo friend={friend} className="my-2">
                  <IconChat
                    className="h-5 w-5 cursor-pointer text-slate-500 hover:text-slate-700"
                    onClick={() => openChat(friend)}
                  />
                </FriendInfo>
              </li>
            ))}
          </ul>
        ) : (
          <div>No friends</div>
        )}
        <Link
          to="/editfriends"
          className="mt-4 inline-block rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Edit Friends
        </Link>
      </DraggableWindow>

      {openChats.map((friend, index) => (
        <ChatWindow
          key={friend.id}
          friend={friend}
          roomName={getRoomName(friend.id)}
          onClose={() => closeChat(friend.id)}
          defaultPosition={{ x: 420 + index * 28, y: 120 + index * 28 }}
          zIndex={30 + index}
        />
      ))}
    </>
  );
}

export default FriendsPanel;