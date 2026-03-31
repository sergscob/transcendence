import { useState } from "react";
import { useNavigate } from "react-router";
import ChatWindow from "@/components/chat/ChatWindow";

export default function Index() {
  const navigate = useNavigate()

  function onLogout() {
    localStorage.setItem("token", '')
    navigate("/login")
  }

  return (
    <div className="flex w-screen h-screen items-center justify-center bg-gray-100">
        <div>
            <div>Main Page</div>
            <div><a className="simple-link" href="/profile">Profile</a></div>
        </div>
        <ChatWindow>  </ChatWindow>

    </div>
  );
}