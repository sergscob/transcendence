export interface IPlayerState {
    user_id: number;
    x: number;
    y: number;
    z: number;
}
export type IStateHandler = (state: IPlayerState) => void;

export function isStateEqual(a: IPlayerState, b: IPlayerState): boolean {
    return a.user_id === b.user_id && a.x === b.x && a.y === b.y && a.z === b.z;
}   


export function createStateExchanger(user_id: number)
{
    const webSocketUrl = `ws://localhost:8000/ws/game/1/`;
    const channel = new WebSocket(webSocketUrl);
    
    let handleRoomState: IStateHandler | null = null;

    function subscribe(handler: IStateHandler) {
        handleRoomState = handler;
    }
    
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
            if (handleRoomState)
                handleRoomState(payload);
        } catch (error) {
            console.error("Invalid WS message payload:", error);
        }
    };

    channel.onerror = (e) => {
        console.error("WebSocket error:", e);
    };


    function sendState(state: IPlayerState) {
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

    return {
        sendState,
        close,
        subscribe,
    };
}