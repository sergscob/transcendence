import * as THREE from 'three'

export const GAME_CONFIG = {
	PLAYER: {
		gravity: 40,
		speed: 7,
		jumpImpulse: 15,
		resetDistance: 50,

		capsule: {
			radius: 0.4,
			height: 1,
		},

		spawnEnd: [3, 5, -5],
	},

	ROCKET: {
		speed: 40,
		maxDistance: 100,
		colliderRadius: 0.1,
		idStride: 1000,

		geometry: {
			radiusTop: 0.02,
			radiusBottom: 0,
			height: 1,
			radialSegments: 3,
			heightSegments: 1,
		},
		materialColor: 0xFFFFFF,
	},

	REMOTE: {
		smoothing: 50,
		playerMeshColor: 0x715947,
	},
} as const


export function getPlayerSpawnEnd(): THREE.Vector3 {
	const [x, y, z] = GAME_CONFIG.PLAYER.spawnEnd
	return new THREE.Vector3(x, y, z)
}

export function getPlayerCapsuleStartFromEnd(end: THREE.Vector3): THREE.Vector3 {
	return end.clone().add(new THREE.Vector3(0, -GAME_CONFIG.PLAYER.capsule.height, 0))
}
