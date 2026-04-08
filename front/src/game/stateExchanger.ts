import { IPlayerState } from './roomState'

type RoomStateCallback = (players: IPlayerState[]) => void
import { useSettingsStore } from "@/stores/settingsStore";

export function createStateExchanger(user_id: number, callbackRoomState: RoomStateCallback) {
    const serverIP = useSettingsStore.getState().serverIP;
    console.log("Game server:", serverIP);
    const webSocketUrl = `ws://${serverIP}/ws/game/1/`;    const channel = new WebSocket(webSocketUrl);

    channel.onopen = () => {
        console.log("WebSocket connection established");
    };

    channel.onmessage = (event) => {
        try {
            const rawPlayers = JSON.parse(event.data) as any
            if (!Array.isArray(rawPlayers)) {
                return
            }

            const players: IPlayerState[] = []
            for (const raw of rawPlayers) {
                if (!raw || typeof raw !== 'object' || raw.user_id === undefined) {
                    continue
                }

                const posArr = raw.pos
                const pos: [number, number, number] = Array.isArray(posArr)
                    ? [Number(posArr[0] ?? 0), Number(posArr[1] ?? 0), Number(posArr[2] ?? 0)]
                    : [0, 0, 0]

                const rotationArr = raw.rotation
                const rotation: [number, number, number] = Array.isArray(rotationArr)
                    ? [Number(rotationArr[0] ?? 0), Number(rotationArr[1] ?? 0), Number(rotationArr[2] ?? 0)]
                    : [0, 0, 0]

                const rocketsRaw = raw.rockets
                const rockets = Array.isArray(rocketsRaw)
                    ? rocketsRaw
                        .filter((r: any) => r && typeof r === 'object')
                        .map((r: any) => {
                            const rPosArr = r.pos
                            const rPos: [number, number, number] = Array.isArray(rPosArr)
                                ? [Number(rPosArr[0] ?? 0), Number(rPosArr[1] ?? 0), Number(rPosArr[2] ?? 0)]
                                : [0, 0, 0]

                            const rRotationArr = r.rotation
                            const rRotation: [number, number, number] = Array.isArray(rRotationArr)
                                ? [Number(rRotationArr[0] ?? 0), Number(rRotationArr[1] ?? 0), Number(rRotationArr[2] ?? 0)]
                                : [0, 0, 0]
                            return {
                                rocket_id: Number(r.rocket_id ?? 0),
                                pos: rPos,
                                rotation: rRotation
                            }
                        })
                    : undefined

                players.push({
                    user_id: Number(raw.user_id),
                    pos,
                    rotation,
                    rockets,
                })
            }

            if (players.length) {
                callbackRoomState(players)
            }
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