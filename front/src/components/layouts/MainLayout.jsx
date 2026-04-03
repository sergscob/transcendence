import { Outlet, Link } from "react-router-dom";
import { useNavigate } from "react-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

import { IoMdExit } from "react-icons/io";
import IconMenu from "@/assets/icons/menu.svg?react";


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
      <div>
        <Link to="/"> 
          <IconMenu className="absolute top-2 left-2 mb-4 h-6 w-6 text-slate-900"/>
        </Link>
      </div>
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