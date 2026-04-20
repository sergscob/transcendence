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
    <div className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="relative z-30">
        <Link to="/">
          <IconMenu className="absolute top-2 left-4 mb-4 h-6 w-6 text-slate-300"/>
        </Link>
      </div>
      <div className="absolute top-2 right-2 z-30 cursor-pointer">
          <div className="flex items-center">
            <Link to={`/profile/${user?.id}`}>
              <span className="text-white mr-3">{user?.username}</span>
            </Link>
            <LangSwitcher className="mr-3"/>
            <IconExit className="w-6 h-6 ml-3 stroke-slate-200" onClick={()=>onLogout()} />
            </div>
      </div>
      <div className="relative z-10 h-screen w-full">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
