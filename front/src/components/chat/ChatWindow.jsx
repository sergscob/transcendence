import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import Button from "@/components/ui_int/Button"
import Input from "@/components/ui_int/Input"
import DraggableWindow from "@/components/ui_int/DraggableWindow";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/stores/settingsStore";


function ChatWindow({
  name,
  friend,
  roomName,
  onClose,
  defaultPosition,
  zIndex,
}) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const channel = useRef(null);
  const user = useUserStore((s) => s.user);
  const serverIP = useSettingsStore((s) => s.serverIP);

  useEffect(() => {
    const webSocketUrl = `ws://${serverIP}/ws/chat/${roomName}/`;
    channel.current = new WebSocket(webSocketUrl);
    channel.current.onopen = () => {
      console.log("WebSocket connection established");
    };
    channel.current.onmessage = (event) => {
    //   console.log("Received message:", event.data);
      setMessages((prevMessages) => {
        // console.log("Current messages:", prevMessages);
        return [...prevMessages, JSON.parse(event.data)]
      });
    };
    channel.current.onerror = (e) => {
      console.log("WebSocket error:", e);
    };
    return () => {
      channel.current && channel.current.close();
    };
  }, [roomName]);


  const sendMessage = (event) => {
    event.preventDefault();
    if (channel.current && channel.current.readyState === WebSocket.OPEN) {
      channel.current.send(JSON.stringify({ message: userMessage.replace(/(.{30})/g,"$1 "), username: user.username, user_id: user.id }));
      setUserMessage("");
    } else {
      console.log("WebSocket is not open. Unable to send message.");
    }
  };

  return (
    <DraggableWindow
      name={name}
      title={friend.username}
      onClose={onClose}
      defaultPosition={defaultPosition}
      zIndex={zIndex}
      className="w-[400px] max-w-[calc(100vw-2rem)]"
      headerClassName="bg-gray-500 text-white"
      bodyClassName="flex h-[450px] flex-col bg-gray-300 text-gray-800"
    >
      <div className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.user_id == user.id ? 'justify-end' : ''}`}>
            <div className="mb-2 rounded-2xl border border-zinc-300 bg-blue-50 px-3 py-1">
              <div className="text-right text-xs font-semibold text-zinc-400">
                {msg.username}
              </div>
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      <form className="flex gap-2 border-t border-gray-400 p-2 bg-gray-400" onSubmit={sendMessage}>
        <Input
          placeholder={t("chat_window.type_message")}
          className="mr-2 grow border placeholder:text-white border-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <Button type="submit" disabled={!userMessage.trim()} className="basis-12">&gt;</Button>
      </form>
    </DraggableWindow>
  );
}

export default ChatWindow;
