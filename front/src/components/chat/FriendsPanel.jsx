import { useEffect, useState } from "react";
import API from "@/api/api";
import { useUserStore } from "@/stores/userStore";
import FriendInfo from "@/components/ui_int/FriendInfo";
import DraggableWindow from "@/components/ui_int/DraggableWindow";
import { useDraggableStore } from "@/stores/draggableStore";
import ChatWindow from "@/components/chat/ChatWindow";
import { Link } from "react-router-dom";
import IconChat from "@/assets/icons/chat.svg?react";

function FriendsPanel() {
  const user = useUserStore((s) => s.user);
  const loaded = useUserStore((s) => s.loaded);
  const [friends, setFriends] = useState([]);
  const [openChats, setOpenChats] = useState([]);
  const positions = useDraggableStore((s) => s.positions);
  const delWindowPosition = useDraggableStore((s) => s.delWindowPosition);

  async function fetchAllData() {
    await Promise.all([
      API.get("friends/").then(res => setFriends(res.data)),
    ]);
  }

  function getRoomName(friendId) {
    const arr = [user.id, friendId].sort()
    return `chat_${String(arr[0])}_${String(arr[1])}`;
  }

  function getFriendIdFromRoomName(roomName) {
    const [prefix, id1, id2] = roomName.split("_");
    if ((id1 != user.id && id2 != user.id) || prefix !== "chat")
      return null;

    return id1 == user.id ? id2 : id1
  }

  useEffect(() => {
    if (loaded && user) {
      fetchAllData();
    }
  }, [loaded, user]);

  useEffect(() => {
    if (!loaded || !user || !friends.length) {
      return;
    }

    const restoredChats = Object.keys(positions)
      .map((roomName) => {
        const friendId = getFriendIdFromRoomName(roomName);
        if (!friendId) 
          return null;

        return friends.find((friend) => String(friend.id) === String(friendId)) ?? null;
      })
      .filter(Boolean)
      .filter((friend, index, array) => array.findIndex((candidate) => candidate.id === friend.id) === index);

    setOpenChats((currentChats) => {
      const currentIds = new Set(currentChats.map((chat) => chat.id));
      const nextChats = [...currentChats];

      restoredChats.forEach((friend) => {
        if (!currentIds.has(friend.id)) {
          nextChats.push(friend);
          currentIds.add(friend.id);
        }
      });

      return nextChats;
    });
  }, [loaded, user, friends, positions]);

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
    delWindowPosition(getRoomName(friendId));
  }

  if (!user) return (<></>)

  return (
    <>
      <DraggableWindow
        name="friends-panel"
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
          name={getRoomName(friend.id)}
          friend={friend}
          roomName={getRoomName(friend.id)}
          onClose={() => closeChat(friend.id)}
          defaultPosition={{ x: 420 + index * 28, y: 120 + index * 28 }}
          zIndex={30 + index}
        />
      ))}
      <div className="absolute">{JSON.stringify(positions)}</div>
    </>
  );
}

export default FriendsPanel;