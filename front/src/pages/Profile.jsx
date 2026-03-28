import { useEffect, useState } from "react";
import API from "../api/api";

function Profile() {
  const [user, setUser] = useState(null);
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
    API.get("profile/").then(res => setUser(res.data)),
    fetchAllData();
  }, []);

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

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <div>{user.username}</div>
      <h2 className="text-lg font-bold">All Friends:</h2>
      <ul>
        {allFriends.map(friend => (
          <li key={friend.id}>
            <div >{friend.username} 
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
            </div>
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-bold">Friends:</h2>
      {friends.length ? 
        <ul>
          {friends.map(friend => (
            <li key={friend.id}>
              <div>
                {friend.username} 
                  <a className="text-xs text-red-400 pl-2" onClick={() => deleteInvitation(friend.id)}> 
                      delete friend
                  </a>
                </div>
            </li>
          ))}
        </ul>
        : <div>No friends</div>}
      <h2 className="text-lg font-bold">Waiting for Approval:</h2>
      {waitingList.length ?  
        <ul>
          {waitingList.map(friend => (
            <li key={friend.id}>
              <div>
                {friend.username}
                <a className="text-xs text-green-600" onClick={() => acceptInvitation(friend.id)}>
                  accept invitation
                </a>
              </div>
            </li>
          ))}
        </ul>
        : <div>Nobody wants to be your friend</div>
      }
    </div>
  );
}

export default Profile;