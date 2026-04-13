import * as THREE from 'three'
import { Octree } from 'three/addons/math/Octree.js'
import { Capsule } from 'three/addons/math/Capsule.js'
import { ICurrentMatchState } from './roomState'
import { GAME_CONFIG, getPlayerCapsuleStartFromEnd, getPlayerSpawnEnd } from './gameConfig'

export function createPlayer(
	camera: THREE.PerspectiveCamera,
	sendShot: (shot: any) => void,
	user_id: number,
	getSpawnIndex: (user_id: number) => number,
	matchState: ICurrentMatchState
	) {

	console.log(matchState.current_player.pos)
	const spawnEnd = new THREE.Vector3(...matchState.current_player.pos)
	const collider = new Capsule(
		getPlayerCapsuleStartFromEnd(spawnEnd),
		spawnEnd.clone(),
		GAME_CONFIG.PLAYER.capsule.radius,
	)
	const velocity = new THREE.Vector3()
	let onFloor = false

	function teleportPlayer(position: THREE.Vector3) {
		collider.set(
			getPlayerCapsuleStartFromEnd(position),
			position,
			GAME_CONFIG.PLAYER.capsule.radius,
		)
	}

	function update(delta: number, keys: Record<string, boolean>, yaw: number, worldOctree: Octree) {
		if (collider.end.length() > GAME_CONFIG.PLAYER.resetDistance) {
			const resetEnd = getPlayerSpawnEnd(getSpawnIndex(user_id))
			teleportPlayer(resetEnd)
		}

		const damping = Math.exp(-4 * delta) - 1
		if (!onFloor) {
			velocity.y -= GAME_CONFIG.PLAYER.gravity * delta
			velocity.addScaledVector(velocity, damping)
		} else {
			velocity.addScaledVector(velocity, damping)
		}

		if (keys['Space'] && onFloor) {
			velocity.y += GAME_CONFIG.PLAYER.jumpImpulse
		}

		const direction = new THREE.Vector3()
		if (keys['KeyW']) direction.z -= 1
		if (keys['KeyS']) direction.z += 1
		if (keys['KeyA']) direction.x -= 1
		if (keys['KeyD']) direction.x += 1

		direction.normalize()
		direction.applyEuler(new THREE.Euler(0, yaw, 0))
		direction.multiplyScalar(GAME_CONFIG.PLAYER.speed * delta)

		collider.translate(direction)
		collider.translate(new THREE.Vector3(0, velocity.y * delta, 0))

		const wasOnFloor = onFloor
		const result = worldOctree.capsuleIntersect(collider)
		onFloor = false
		if (result) {
			onFloor = result.normal.y > 0
			if (onFloor) {
				if (!wasOnFloor && -velocity.y > GAME_CONFIG.PLAYER.landingSpeedToTakeDamage) {
					sendShot(user_id)
				}
				velocity.y = 0
			}
			collider.translate(result.normal.multiplyScalar(result.depth))
		}

		camera.position.copy(collider.end)
	}

	return { update, teleportPlayer }
}
