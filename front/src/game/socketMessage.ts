export interface IMatchState {
	players_count: number;
	time_left: string;
	match_status: string;
	online_players: number;
	max_players: number;
}

export interface IPlayerState {
	user_id: number;
	health: number;
	score: number;
	is_ready: boolean;
	pos: [number, number, number];
	rotation: [number, number, number];
	rockets?: Array<{ pos: [number, number, number]; rotation: [number, number, number]; rocket_id: number }>;
}

export function getPlayersFromMessage(messageObj: any): Array<IPlayerState> {
	const matchState = messageObj.matchState
	const playersObj = matchState?.players
	if (!playersObj || typeof playersObj !== 'object') {
		console.log("Invalid WS message payload: ", matchState)
		return
	}

	const rawPlayers = Object.values(playersObj) as any[]
	if (!Array.isArray(rawPlayers)) {
		console.log("Invalid WS message payload: ", matchState);
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
			health: Number(raw.health),
			score: Number(raw.score),
			is_ready: Boolean(raw.is_ready),
			pos,
			rotation,
			rockets,
		})
	}

	return players
}

export function getMatchState(messageObj: any): IMatchState {
	const matchState = messageObj.matchState
	if (!matchState || typeof matchState !== 'object') {
		console.log("Invalid WS message payload: ", matchState)
		return
	}

	const result: IMatchState = {
		online_players: Number(matchState?.live_players),
		time_left: String(matchState?.time),
		players_count: Number(matchState?.players_count),
		match_status: String(matchState?.match_status),
		max_players: Number(matchState?.max_players)
	}

	return result
}