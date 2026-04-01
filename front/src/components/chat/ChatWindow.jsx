import { Spinner } from "@/components/ui/Spinner"
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

function ChatWindow({ children, className="", loading=false, ...props }) {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const WEBOCKET_URL = "ws://localhost:8000/ws/chat/1/"
  const channel = useRef(null);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    channel.current = new WebSocket(WEBOCKET_URL);
    channel.current.onopen = () => {
      console.log("WebSocket connection established");
    };
    channel.current.onmessage = (event) => {
      console.log("Received message:", event.data);
      setMessages((prevMessages) => {
        console.log("Current messages:", prevMessages);
        return [...prevMessages, JSON.parse(event.data)]
      });
    };
    channel.current.onerror = (e) => {
      console.error("WebSocket error:", e);
    };
    return () => {
      channel.current && channel.current.close();
    };
  }, []);


  const sendMessage = () => {
    if (channel.current && channel.current.readyState === WebSocket.OPEN) {
      console.log("Sending message:", userMessage);
      channel.current.send(JSON.stringify({ message: userMessage, username: user.username, user_id: user.id }));
      setUserMessage("");
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  };

  return (
    <div
      className={`absolute w-120 h-120 bottom-10 right-10 p-2 rounded-lg shadow-lg shadow-zinc-500 border-2 border-zinc-100 bg-gray-100 text-gray-800
        ${className} 
      `}
    >
        <h2 className="text-center text-zinc-500">Chat</h2>
        <div className="">
          {messages.map((msg, index) => (
            
            <div key={index} className="flex justify-end">
              <div className="py-1 px-3 border mb-2 float-right border-zinc-300 bg-blue-50 rounded-2xl">
                <div className="text-xs text-zinc-400 text-right font-semibold">{msg.username}</div>
                {msg.message} 
              </div>
            </div>
            
          ))}
        </div>

      <div className="flex absolute bottom-2 w-full left-1 right-1">
        <Input 
          placeholder="Type your message..."
          className="border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            text-sm  mr-2 grow"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <Button onClick={() => sendMessage()} className="basis-3"> &gt; </Button>
      </div>
    </div>
  );
}

export default ChatWindow;