import { useState } from "react";
import { useNavigate } from "react-router";
import MainMenu from "@/components/common/MainMenu";
import FriendsPanel from "@/components/chat/FriendsPanel";
import { Link } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  function onLogout() {
    localStorage.setItem("token", '');
    navigate("/login");
  }

  return (
    <div className="w-screen h-screen flex justify-center bg-gray-100 overflow-hidden">
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
