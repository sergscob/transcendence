import * as THREE from 'three'
import { Octree } from 'three/addons/math/Octree.js'
import { Capsule } from 'three/addons/math/Capsule.js'

import { GAME_CONFIG, getPlayerCapsuleStartFromEnd, getPlayerSpawnEnd } from './gameConfig'

export function createPlayer(camera: THREE.PerspectiveCamera) {
	const spawnEnd = getPlayerSpawnEnd()
	const collider = new Capsule(
		getPlayerCapsuleStartFromEnd(spawnEnd),
		spawnEnd.clone(),
		GAME_CONFIG.PLAYER.capsule.radius,
	)

	const velocity = new THREE.Vector3()
	let onFloor = false
	let lastLandingSpeed = 0
	const HARD_LANDING_SPEED = 7

	function update(delta: number, keys: Record<string, boolean>, yaw: number, worldOctree: Octree) {
		if (collider.end.length() > GAME_CONFIG.PLAYER.resetDistance) {
			const resetEnd = getPlayerSpawnEnd()
			collider.set(
				getPlayerCapsuleStartFromEnd(resetEnd),
				resetEnd,
				GAME_CONFIG.PLAYER.capsule.radius,
			)
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

		// Déplacement
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

		// Collision avec le monde
		const wasOnFloor = onFloor
		const result = worldOctree.capsuleIntersect(collider)
		onFloor = false
		if (result) {
			onFloor = result.normal.y > 0
			if (onFloor) {
				if (!wasOnFloor && -velocity.y >= HARD_LANDING_SPEED) {
					lastLandingSpeed = -velocity.y
					console.log('Hard landing, speed', lastLandingSpeed)
				}
				velocity.y = 0
			}
			collider.translate(result.normal.multiplyScalar(result.depth))
		}

		// La caméra suit le haut de la capsule
		camera.position.copy(collider.end)
	}

	function getHitGroundDamage(): number {
		if (lastLandingSpeed < HARD_LANDING_SPEED) return 0
		const hit = lastLandingSpeed / HARD_LANDING_SPEED 
		console.log('hit ', hit)

		lastLandingSpeed = 0
		return hit
	}

	return { update, getHitGroundDamage }
}
