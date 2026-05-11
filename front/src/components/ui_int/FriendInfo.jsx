import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import { elipsys } from "@/utils/showUtils";

function FriendInfo({friend, children, className = "", ...props}) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <Avatar user={friend} />
      <Link to={`/profile/${friend.id}`} className="leading-4 break-all" title={friend?.username}>{elipsys(friend.username)}</Link>
      {children}
    </div>
  );
}

export default FriendInfo;