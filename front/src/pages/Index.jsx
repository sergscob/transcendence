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
    <div className="flex w-screen h-screen justify-center bg-gray-100">
        <div>
            <div className="mt-20">Main Page</div>
            <div><a className="simple-link" href="/editprofile">Edit profile</a></div>
            <div><a className="simple-link" href="/friends">Friends</a></div>
        </div>
        <ChatWindow>  </ChatWindow>

    </div>
  );
}