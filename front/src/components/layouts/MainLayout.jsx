import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router";
import { IoMdExit } from "react-icons/io";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

export default function MainLayout() {
  const navigate = useNavigate()
  const loadUser = useUserStore((s) => s.loadUser);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    loadUser(); 
  }, []);

  function onLogout() {
    localStorage.setItem("token", '')
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute top-2 right-2 cursor-pointer" onClick={()=>onLogout()}>
        {
          user 
          ? <div className="flex flex-col items-end">
            <span className="ml-1 ">{user.username}</span> 
            <IoMdExit size={20}/>
            </div>
          : ''  
        } 
        
      </div>
      <Outlet />
    </div>
  );
}