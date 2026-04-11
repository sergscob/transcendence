type CallbackOnMessage = (messageObj: any) => void
import { useSettingsStore } from "@/stores/settingsStore";

export function createStateExchanger(
	user_id: number,
	matchId: string,
	callbackRoomState: CallbackOnMessage,
	callbackStartRoom: CallbackOnMessage,
	callbackStopRoom: CallbackOnMessage
	) {
    const serverIP = useSettingsStore.getState().serverIP;
    console.log("Game server:", serverIP);
    const webSocketUrl = `ws://${serverIP}/ws/game/${matchId}/`;
    const channel = new WebSocket(webSocketUrl);

    channel.onopen = () => {
        console.log("WebSocket connection established");
    };

    channel.onmessage = (event) => {
        const messageObj = JSON.parse(event.data) as any
		if (messageObj?.type === 'state') {
			callbackRoomState(messageObj)
		} else if (messageObj?.type === 'start') {
			callbackStartRoom(messageObj)
		} else if (messageObj?.type === 'stop') {
			callbackStopRoom(messageObj)
		}
    };

    channel.onerror = (e) => {
        console.error("WebSocket error:", e);
    };

    function sendState(state: any) {
        if (channel && channel.readyState === WebSocket.OPEN) {
            channel.send(JSON.stringify({ type: 'state', state, user_id, match_id: matchId }));
        } else {
            console.error("WebSocket is not open. Unable to send message.");
        }
    }

    function sendShot(shot_id: any) {
        if (channel && channel.readyState === WebSocket.OPEN) {
            channel.send(JSON.stringify({ type: 'shot', shot_id, user_id, match_id: matchId }));
        } else {
            console.error("WebSocket is not open. Unable to send message.");
        }
    }


    function close() {
        if (channel && channel.readyState !== WebSocket.CLOSED) {
            channel.close();
        }
    }

    return {sendState, sendShot, close};
}