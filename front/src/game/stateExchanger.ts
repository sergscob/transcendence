import { useSettingsStore } from "@/stores/settingsStore"
import { ICurrentMatchState } from './roomState'

type CallbackOnMessage = (messageObj: any) => void

export function createStateExchanger(
	user_id: number,
	matchId: string,
	callbackRoomState: CallbackOnMessage,
	callbackStartRoom: CallbackOnMessage,
	callbackStopRoom: CallbackOnMessage,
	getMatchState: () => ICurrentMatchState
	) {
	let connectionEstablish = false
    const serverIP = useSettingsStore.getState().serverIP;
    console.log("Game server:", serverIP);
    const webSocketUrl = `ws://${serverIP}/ws/game/${matchId}/`;
    const channel = new WebSocket(webSocketUrl);

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

    channel.onerror = (event) => {
        console.log("WebSocket error:", event);
    };

	channel.onopen = (event) => {
		connectionEstablish = true
		console.log("WebSocket open:", event);
	}

    function sendState(state: any) {
        if (getMatchState().current_player.is_view) {
            return
        }
        if (channel && channel.readyState === WebSocket.OPEN) {
            channel.send(JSON.stringify({ type: 'state', state, user_id, match_id: matchId }));
        } else {
            console.log("WebSocket is not open. Unable to send message.");
        }
    }

    function sendShot(shot_id: any) {
        if (getMatchState().current_player.is_view) {
            return
        }
        if (channel && channel.readyState === WebSocket.OPEN) {
            channel.send(JSON.stringify({ type: 'shot', shot_id, user_id, match_id: matchId }));
        } else {
            console.log("WebSocket is not open. Unable to send message.");
        }
    }

    function close() {
        if (channel && channel.readyState !== WebSocket.CLOSED) {
            channel.close();
        }
		console.log("WebSocket close");
	}

	function getConnectionStatus() {
		return connectionEstablish
	}

    return {sendState, sendShot, close, getConnectionStatus};
}