import avatarSvg from '../../assets/images/avatar.svg';
import { IMAGES_DIR } from "../../../config";

function FriendInfo({friend, children, className = "", ...props}) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <img 
        className={`w-6 h-6 rounded-full border ${friend.online ? 'border-green-500 border-2' : 'border-gray-200'}`} 
        src={friend.avatar ? IMAGES_DIR+friend.avatar : avatarSvg}  
      />
        {friend.username} 
        {children}
    </div>
  );
}

export default FriendInfo;