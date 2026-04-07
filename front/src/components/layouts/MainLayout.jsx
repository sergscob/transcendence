import { Outlet, Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";

import IconMenu from "@/assets/icons/menu.svg?react";
import IconExit from "@/assets/icons/exit.svg?react";
import LangSwitcher from "@/components/common/LangSwitcher"
import Footer from "../common/Footer";

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation();
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
          <IconMenu className="absolute top-2 left-4 mb-4 h-6 w-6 text-slate-500"/>
        </Link>
      </div>
      <div className="absolute top-2 right-2 z-30 cursor-pointer">
          <div className="flex items-center">
            <span className="text-gray-500 mr-3">{user?.username}</span> 
            <LangSwitcher className="mr-3"/>
            <IconExit className="w-6 h-6 ml-3" onClick={()=>onLogout()} />
            </div>
      </div>
      <div className="relative z-0 h-screen w-full">
        <Outlet />
      </div>

      { location.pathname !== '/game' && <Footer /> } 

    </div>
  );
}