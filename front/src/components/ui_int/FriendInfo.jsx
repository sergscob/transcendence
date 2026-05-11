import { Link } from "react-router-dom";
import Avatar from "./Avatar";

function FriendInfo({friend, children, className = "", ...props}) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <Avatar user={friend} />
      <Link to={`/profile/${friend.id}`} className="leading-4 break-all max-w-50">{friend.username}</Link>
      {children}
    </div>
  );
}

export default FriendInfo;