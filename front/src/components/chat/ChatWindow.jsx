import { Spinner } from "@/components/ui/Spinner"

function ChatWindow({ children, className="", loading=false, ...props }) {
  const WEBOCKET_URL = "ws://localhost:8000/ws/chat/1"
  let channel
  try {
    channel = new WebSocket(WEBOCKET_URL)
  }
  catch (e) {
    console.error("WebSocket connection failed:", e);
  }
  channel.onopen = () => {
    console.log("WebSocket connection established");
  }
    channel.onmessage = (event) => {  

  }
return (
    <div
      className={`absolute w-50 h-120 bottom-10 right-10 p-2 rounded-lg shadow-lg shadow-zinc-500 border-2 border-zinc-100 bg-gray-100 text-gray-800
        ${className} 
      `}
    >
        <h2 className="text-center text-zinc-500">Chat</h2>
      { loading ? <Spinner className="size-6"/> : children }
    </div>
  );
}

export default ChatWindow;