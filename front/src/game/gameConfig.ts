import * as THREE from 'three'

export const GAME_CONFIG = {
	PLAYER: {
		gravity: 40,
		speed: 7,
		jumpImpulse: 10,
		resetDistance: 50,
		landingSpeedToTakeDamage: 8,
		totalAmmo: 10,
		capsule: {
			radius: 0.3,
			height: 1,
		},

		spawnEnd: [
			[5.4, 5.8, -16.8],
			[2.7, 5.9, -12.3],
			[2, 2, -5],
			[-2.3, 7.4, 4.5],
			[23.5, 10.3, 11.3],
			[-4, 14.8, 1.3],
			[2, 6.1, 30],
			[-22.8, 4.2, 21.4],
			[7.5, 4.8, 15],
			[14, 7.4, -27.8]
		],
	},

	ROCKET: {
		speed: 60,
		maxDistance: 100,
		colliderSize: [0.02, 0.02, 1],
		idStride: 1000,

		geometry: {
			radiusTop: 0.02,
			radiusBottom: 0,
			height: 0.1,
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


export function getPlayerSpawnEnd(index: number): THREE.Vector3 {
	// const [x, y, z] = GAME_CONFIG.PLAYER.spawnEnd[index]
	return new THREE.Vector3(...GAME_CONFIG.PLAYER.spawnEnd[index])
}

export function getPlayerCapsuleStartFromEnd(end: THREE.Vector3): THREE.Vector3 {
	return end.clone().add(new THREE.Vector3(0, -GAME_CONFIG.PLAYER.capsule.height, 0))
}
