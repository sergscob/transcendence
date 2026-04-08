import * as THREE from 'three'
import { Octree } from 'three/addons/math/Octree.js'

import { GAME_CONFIG } from './gameConfig'


export function createRocketInstance(user_id: number) {
	const ROCKET_ID_STRIDE = GAME_CONFIG.ROCKET.idStride
	let nextRocketNumber = 1
	const rockets: Array<{rocket_id: number, mesh: THREE.Mesh, collider: THREE.Sphere}> = []

	function generateRocketId() {
		return user_id * ROCKET_ID_STRIDE + nextRocketNumber++
	}

	function createRocket(): THREE.Mesh {
		const g = GAME_CONFIG.ROCKET.geometry
		const rocketGeometry = new THREE.CylinderGeometry(
			g.radiusTop,
			g.radiusBottom,
			g.height,
			g.radialSegments,
			g.heightSegments,
		)
		const rocketMaterial = new THREE.MeshLambertMaterial({ color: GAME_CONFIG.ROCKET.materialColor })
		const rocket = new THREE.Mesh(rocketGeometry, rocketMaterial)
		rocket.geometry.rotateX(-Math.PI / 2)

		return rocket
	}

	function update(scene: THREE.Scene, camera: THREE.PerspectiveCamera, click: boolean, delta: number, worldOctree: Octree) {
		for (let i = rockets.length - 1; i >= 0; i--) {
			const rocketMesh = rockets[i].mesh
			const rocketCollider = rockets[i].collider
			const direction = new THREE.Vector3()
			rocketMesh.getWorldDirection(direction)
			rocketMesh.position.addScaledVector(direction, GAME_CONFIG.ROCKET.speed * delta)
			
			if (rocketMesh.position.length() > GAME_CONFIG.ROCKET.maxDistance || worldOctree.sphereIntersect(rocketCollider)) {
				scene.remove(rocketMesh)
				rockets.splice(i, 1)
			}
		}

		if (click) {
			const newRocket = createRocket()
			const rocketId = generateRocketId()
			
			const camDir = new THREE.Vector3()
			camera.getWorldDirection(camDir)

			newRocket.position.copy(camera.position)
			const target = newRocket.position.clone().add(camDir)
			newRocket.lookAt(target)
			const newCollider = new THREE.Sphere(newRocket.position, GAME_CONFIG.ROCKET.colliderRadius)
	
			rockets.push({rocket_id: rocketId, mesh: newRocket, collider: newCollider})
			scene.add(newRocket)
		}
	}

	function state(): Array<{ pos: Array<number>; rocket_id: number }> {
		return rockets.map(({ rocket_id, mesh }) => ({
			rocket_id,
			pos: mesh.position.toArray(),
			rotation: mesh.rotation.toArray()
		}))
	}

	return {update, state, createRocket}
} 