import { useState } from "react";
import { useNavigate } from "react-router";
import MainMenu from "@/components/common/MainMenu";
import FriendsPanel from "@/components/chat/FriendsPanel";
import { Link } from "react-router-dom";
import Rain from "../components/ui/rain.tsx"; // Your new import

export default function Index() {
  const navigate = useNavigate();

  function onLogout() {
    localStorage.setItem("token", '');
    navigate("/login");
  }

  return (
    <div className="relative w-screen h-screen flex justify-center bg-gray-100 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Rain />
      </div>

      <div className="relative z-10 flex w-full h-full justify-center items-center">
        <div className="flex justify-center items-center">
          <MainMenu />
        </div>
        <FriendsPanel />
        {/* <ChatWindow> </ChatWindow> */}
      </div>

    </div>
  );
}
