import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Octree } from 'three/addons/math/Octree.js'

export function loadWorld(scene: THREE.Scene): Octree {
	const worldOctree = new Octree()

	const loader = new GLTFLoader()
	loader.load('/models/collision-world.glb', (gltf) => {
		// const bigCube = new THREE.Mesh(
		// 	new THREE.BoxGeometry(1, 1, 1),
		// 	new THREE.MeshStandardMaterial({ color: 0xffd400 })
		// )
		// bigCube.position.set(3, -1, -7)
		// gltf.scene.add(bigCube)

		scene.add(gltf.scene)
		worldOctree.fromGraphNode(gltf.scene)

		gltf.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true
				child.receiveShadow = true
				if (child.material.map)
					child.material.map.anisotropy = 4
			}
		})
	})

	return worldOctree
}