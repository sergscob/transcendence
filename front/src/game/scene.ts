import * as THREE from 'three'

export function createScene() {
	const scene = new THREE.Scene()
	scene.background = new THREE.Color(0x87ceeb)

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
	scene.add(ambientLight)

	const sunLight = new THREE.DirectionalLight(0xffffff, 1)
	sunLight.position.set(10, 20, 10)
	scene.add(sunLight)

	function colorSceneSetter(color: THREE.ColorRepresentation) {
		sunLight.color.set(color);
		ambientLight.color.set(color);
	}

	function colorSceneGetter(): THREE.Color {
		return sunLight.color
	}

	return {scene, colorSceneSetter, colorSceneGetter}
}