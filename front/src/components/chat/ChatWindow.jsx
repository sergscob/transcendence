import { Spinner } from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { useEffect, useRef, useState } from "react";

function ChatWindow({ children, className="", loading=false, ...props }) {
  const [userMessage, setUserMessage] = useState("");
  const WEBOCKET_URL = "ws://localhost:8000/ws/chat/1/"
  const channel = useRef(null);

  useEffect(() => {
    channel.current = new WebSocket(WEBOCKET_URL);
    channel.current.onopen = () => {
      console.log("WebSocket connection established");
    };
    channel.current.onmessage = (event) => {
      console.log("Received message:", event.data);
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
      channel.current.send(JSON.stringify({ message: userMessage }));
      setUserMessage("");
    } else {
      console.error("WebSocket is not open. Unable to send message.");
    }
  };

  return (
    <div
      className={`absolute w-50 h-120 bottom-10 right-10 p-2 rounded-lg shadow-lg shadow-zinc-500 border-2 border-zinc-100 bg-gray-100 text-gray-800
        ${className} 
      `}
    >
        <h2 className="text-center text-zinc-500">Chat</h2>
      { loading ? <Spinner className="size-6"/> : children }
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