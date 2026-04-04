import * as THREE from 'three'
import { Octree } from 'three/addons/math/Octree.js'

const ROCKET_SPEED = 30

export function createRocketInstance() {
	const rockets: Array<{mesh: THREE.Mesh, collider: THREE.Sphere}> = []

	function createRocket(): THREE.Mesh {
		const rocketGeometry = new THREE.CylinderGeometry(0.05, 0, 0.5, 3, 1);
		const rocketMaterial = new THREE.MeshLambertMaterial({color : 0x006633})
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
			rocketMesh.position.addScaledVector(direction, ROCKET_SPEED * delta)
			
			if (rocketMesh.position.length() > 100 || worldOctree.sphereIntersect(rocketCollider)) {
				scene.remove(rocketMesh)
				rockets.splice(i, 1)
			}
		}

		if (click) {
			const newRocket = createRocket()
			
			const camDir = new THREE.Vector3()
			camera.getWorldDirection(camDir)

			newRocket.position.copy(camera.position)
			const target = newRocket.position.clone().add(camDir)
			newRocket.lookAt(target)
			const newCollider = new THREE.Sphere(newRocket.position, 0.5)
	
			rockets.push({mesh: newRocket, collider: newCollider})
			scene.add(newRocket)
		}
	}

	function state(): string {
		return JSON.stringify(
			rockets.map(({mesh}) => ({
				position: mesh.position.toArray()
			}))
		)
	}

	return {update, state}
} 