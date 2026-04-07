import * as THREE from 'three'

export const GAME_CONFIG = {
	PLAYER: {
		gravity: 40,
		speed: 7,
		jumpImpulse: 15,
		resetDistance: 50,

		// `Capsule` est définie par (start, end, radius)
		// Ici, `height` = distance entre start et end (la partie cylindrique)
		capsule: {
			radius: 0.4,
			height: 1,
		},

		// Positions de spawn = position `end` de la capsule (la caméra se colle sur `end`)
		spawnEnd: [3, 2, -5],
	},

	ROCKET: {
		speed: 30,
		maxDistance: 100,
		colliderRadius: 0.1,
		idStride: 1000,

		geometry: {
			radiusTop: 0.03,
			radiusBottom: 0,
			height: 0.6,
			radialSegments: 3,
			heightSegments: 1,
		},
		materialColor: 0x0033FF,
	},

	REMOTE: {
		smoothing: 50,
		playerMeshColor: 0xffffff,
	},
} as const


export function getPlayerSpawnEnd(): THREE.Vector3 {
	const [x, y, z] = GAME_CONFIG.PLAYER.spawnEnd
	return new THREE.Vector3(x, y, z)
}

export function getPlayerCapsuleStartFromEnd(end: THREE.Vector3): THREE.Vector3 {
	return end.clone().add(new THREE.Vector3(0, -GAME_CONFIG.PLAYER.capsule.height, 0))
}
