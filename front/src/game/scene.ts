import * as THREE from 'three'

export function createScene(): THREE.Scene {
	const scene = new THREE.Scene()
	scene.background = new THREE.Color(0x87ceeb)

	const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
	scene.add(ambientLight)

	const sunLight = new THREE.DirectionalLight(0xffffff, 1)
	sunLight.position.set(10, 20, 10)
	scene.add(sunLight)

	// const floorGeometry = new THREE.PlaneGeometry(50, 50)
	// const floorMaterial = new THREE.MeshLambertMaterial({color : 0x808080})
	// const floor = new THREE.Mesh(floorGeometry, floorMaterial)
	// floor.rotateX(-Math.PI / 2)
	// scene.add(floor)

	return scene
}