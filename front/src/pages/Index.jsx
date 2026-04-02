import { useState } from "react";
import { useNavigate } from "react-router";
import ChatWindow from "@/components/chat/ChatWindow";
import { Link } from "react-router-dom";

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
            <div><Link className="simple-link" to="/editprofile">Edit profile</Link></div>
            <div><Link className="simple-link" to="/editfriends">Friends</Link></div>
        </div>
        <ChatWindow>  </ChatWindow>

    </div>
  );
}