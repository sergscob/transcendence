import * as THREE from 'three'

export const GAME_CONFIG = {
	PLAYER: {
		gravity: 40,
		speed: 7,
		jumpImpulse: 15,
		resetDistance: 50,
		fallDAmage: 25,
		landingSpeedToTakeDamage: 10,

		capsule: {
			radius: 0.2,
			height: 1,
		},

		spawnEnd: [3, 5, -5],
	},

	ROCKET: {
		speed: 40,
		maxDistance: 100,
		colliderSize: [0.2, 0.2, 1.0],
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
		smoothing: 60,
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
