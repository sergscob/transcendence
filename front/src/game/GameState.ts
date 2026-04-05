import { useSettingsStore } from "@/stores/settingsStore";

export interface IPlayerState {
    user_id: number;
    x: number;
    y: number;
    z: number;
}
export type IStateHandler = (state: IPlayerState) => void;

export function isStateEqual(a: IPlayerState, b: IPlayerState): boolean {
    function round2(value: number): number {
        return Math.round(value * 100) / 100;
    }
    return (
        a.user_id === b.user_id &&
        round2(a.x) === round2(b.x) &&
        round2(a.y) === round2(b.y) &&
        round2(a.z) === round2(b.z)
    );
}   
export function copyState(a: IPlayerState, b: IPlayerState): void {
    a.user_id = b.user_id;
    a.x = b.x;
    a.y = b.y;
    a.z = b.z;
}


export function createStateExchanger(user_id: number)
{
    const serverIP = useSettingsStore.getState().serverIP;
    console.log("Using server IP:", serverIP);
    const webSocketUrl = `ws://${serverIP}/ws/game/1/`;
    const channel = new WebSocket(webSocketUrl);
 
    let handleRoomState: IStateHandler | null = null;
    let pendingRoomStates: IPlayerState[] = [];
	const prevState: IPlayerState = {
		user_id: -1, x: -1, y: -1, z: -1
	}


    function subscribe(handler: IStateHandler) {
        handleRoomState = handler;
        while (pendingRoomStates.length > 0) {
            handleRoomState(pendingRoomStates.shift()!);
        }
        pendingRoomStates = [];
    }
    
    channel.onopen = () => {
        console.log("WebSocket connection established");
    };

    channel.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            if (!payload || typeof payload !== 'object' || !payload.state || !payload.user_id ) 
                return;

			if (handleRoomState)
                handleRoomState(payload.state);
			else
				pendingRoomStates.push(payload.state);
        } catch (error) {
            console.error("Invalid WS message payload:", error);
        }
    };

    channel.onerror = (e) => {
        console.error("WebSocket error:", e);
    };


    function sendState(state: IPlayerState) {

        if (isStateEqual(state, prevState))
            return;
        copyState(prevState, state);

        if (channel && channel.readyState === WebSocket.OPEN) {

            channel.send(JSON.stringify({ state, user_id }));
            console.log("Sent state:", state);
        } else {
            console.error("WebSocket is not open");
        }
    }

    function close() {
        if (channel && channel.readyState !== WebSocket.CLOSED) 
            channel.close();
    }

    return {
        sendState,
        close,
        subscribe,
    };
}