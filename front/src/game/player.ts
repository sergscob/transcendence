import * as THREE from 'three'
import { Octree } from 'three/addons/math/Octree.js'
import { Capsule } from 'three/addons/math/Capsule.js'

const GRAVITY = 40
const SPEED   = 7
const JUMP    = 15

export function createPlayer(camera: THREE.PerspectiveCamera) {
	const collider = new Capsule(
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, 1, 0),
		0.3
	)

	const velocity = new THREE.Vector3()
	let onFloor = false

	function update
		(delta: number, keys: Record<string, boolean>, yaw: number, worldOctree: Octree) {
		const damping = Math.exp(-4 * delta) - 1
		if (!onFloor) {
			velocity.y -= GRAVITY * delta
			velocity.addScaledVector(velocity, damping)
		} else {
			velocity.addScaledVector(velocity, damping)
		}

		if (keys['Space'] && onFloor) {
			velocity.y += JUMP
		}

		// Déplacement
		const direction = new THREE.Vector3()
		if (keys['KeyW']) direction.z -= 1
		if (keys['KeyS']) direction.z += 1
		if (keys['KeyA']) direction.x -= 1
		if (keys['KeyD']) direction.x += 1

		direction.normalize()
		direction.applyEuler(new THREE.Euler(0, yaw, 0))
		direction.multiplyScalar(SPEED * delta)

		collider.translate(direction)
		collider.translate(new THREE.Vector3(0, velocity.y * delta, 0))

		// Collision avec le monde
		const result = worldOctree.capsuleIntersect(collider)
		onFloor = false
		if (result) {
			onFloor = result.normal.y > 0
			if (onFloor)
				velocity.y = 0
			collider.translate(result.normal.multiplyScalar(result.depth))
		}

		// La caméra suit le haut de la capsule
		camera.position.copy(collider.end)
	}

	return {update}
}