import avatarSvg from '../../assets/images/avatar.svg';
import { IMAGES_DIR } from "../../../config";

function Avatar({user, size = "32", className = "", ...props}) {
  return (
    <img 
        className={`rounded-full border shrink-0 ${user.online ? 'border-green-500 border-2' : 'border-gray-200'}`} 
        style={{width: size + 'px', height: size+'px'}}
        src={user.avatar ? IMAGES_DIR+user.avatar : avatarSvg}  
    />
  );
}

export default Avatar;