import * as THREE from 'three'

export function createScene(): THREE.Scene {
	const scene = new THREE.Scene()
	scene.background = new THREE.Color(0x87ceeb)

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
	scene.add(ambientLight)

	const sunLight = new THREE.DirectionalLight(0xffffff, 1)
	sunLight.position.set(10, 20, 10)
	scene.add(sunLight)

	return scene
}