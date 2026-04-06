import { Outlet, Link } from "react-router-dom";
import { useNavigate } from "react-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

import { IoMdExit } from "react-icons/io";
import IconMenu from "@/assets/icons/menu.svg?react";
import LangSwitcher from "@/components/ui_int/LangSwitcher"

export default function MainLayout() {
  const navigate = useNavigate()
  const loadUser = useUserStore((s) => s.loadUser);
  const user = useUserStore((s) => s.user);
  useEffect(() => {
    loadUser(); 
  }, [loadUser]);

  function onLogout() {
    localStorage.setItem("token", '')
    navigate("/login")
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative z-30">
        <Link to="/"> 
          <IconMenu className="absolute top-2 left-2 mb-4 h-6 w-6 text-slate-900"/>
        </Link>
      </div>
      <div className="absolute top-2 right-2 z-30 cursor-pointer">
          <div className="flex items-center">
            <span className="text-gray-500 mr-3">{user?.username}</span> 
            <LangSwitcher className="mr-3"/>
            <IoMdExit size={25} className="ml-3" onClick={()=>onLogout()} />
            </div>
      </div>
      <div className="relative z-0 h-screen w-full">
        <Outlet />
      </div>
    </div>
  );
}