import { Outlet, Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";
import backgroundImage from "@/assets/images/brick-bg.jpg";

import IconMenu from "@/assets/icons/menu.svg?react";
import IconExit from "@/assets/icons/exit.svg?react";
import LangSwitcher from "@/components/common/LangSwitcher"
import Footer from "../common/Footer";

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation();
  const loadUser = useUserStore((s) => s.loadUser);
  const user = useUserStore((s) => s.user);
  const resetUser = useUserStore((s) => s.resetUser);
  useEffect(() => {
    console.log("load user")
    loadUser();
  }, [loadUser]);

  function onLogout() {
    localStorage.setItem("token", '')
    resetUser();
    navigate("/login")
  }

  return (
    <div className="relative min-h-screen _overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="relative z-3">
        <Link to="/">
          <IconMenu className="absolute top-2 left-4 mb-4 h-6 w-6 text-slate-300"/>
        </Link>
      </div>
      <div className="absolute top-2 right-2 z-3 cursor-pointer flex flex-col items-end">
          <div className="flex items-center justify-end mb-2">
            <LangSwitcher className="mr-3"/>
            <IconExit className="w-6 h-6 ml-3 stroke-slate-200" onClick={()=>onLogout()} />
          </div>
            <Link to={`/profile/${user?.id}`}>
             <span className="text-white underline">{user?.username}</span>
            </Link>
      </div>
      <div className="relative _z-10 h-screen w-full">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
