import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Octree } from 'three/addons/math/Octree.js'

export function loadWorld(scene: THREE.Scene): Octree {
	const worldOctree = new Octree()

	const loader = new GLTFLoader()
	loader.load('/models/dm-turbine_-_ut_multiplayer_map.glb', (gltf) => {
		gltf.scene.scale.set(1, 1, 1)

		const box = new THREE.Box3().setFromObject(gltf.scene)
		if (!box.isEmpty()) {
			const center = box.getCenter(new THREE.Vector3())
			const min = box.min.clone()
			gltf.scene.position.x -= center.x
			gltf.scene.position.z -= center.z
			gltf.scene.position.y -= min.y
			gltf.scene.updateMatrixWorld(true)
		}

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
	}, undefined, (err) => {
		console.error('Failed to load world GLB:', err)
	})

	return worldOctree
}