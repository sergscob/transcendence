import { useState } from "react";
import { useNavigate } from "react-router";
import MainMenu from "@/components/common/MainMenu";
import FriendsPanel from "@/components/chat/FriendsPanel";
import { Link } from "react-router-dom";
import { logout } from "../utils/auth";

export default function Index() {
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="w-screen _h-screen flex justify-center overflow-hidden py-12">
      <div className="flex w-full h-full justify-center items-center">
        <div className="flex justify-center items-center">
          <MainMenu />
        </div>
        <FriendsPanel />
        {/* <ChatWindow> </ChatWindow> */}
      </div>

    </div>
  );
}
