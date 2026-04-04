export function createStateExchanger(user_id: Number, handleRoomState:any )
{
    const webSocketUrl = `ws://localhost:8000/ws/game/1/`;
    const channel = new WebSocket(webSocketUrl);

    channel.onopen = () => {
        console.log("WebSocket connection established");
    };

    channel.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            if (!payload || typeof payload !== 'object') {
                return;
            }
            if (payload.state === undefined || payload.user_id === undefined) {
                return;
            }
            handleRoomState(payload);
        } catch (error) {
            console.error("Invalid WS message payload:", error);
        }
    };

    channel.onerror = (e) => {
        console.error("WebSocket error:", e);
    };

    function sendState(state: any) {
        if (channel && channel.readyState === WebSocket.OPEN) {
            channel.send(JSON.stringify({ state, user_id }));
        } else {
            console.error("WebSocket is not open. Unable to send message.");
        }
    }

    function close() {
        if (channel && channel.readyState !== WebSocket.CLOSED) {
            channel.close();
        }
    }

    return {sendState, close};
}