import * as THREE from 'three'

export function createCamera(container: HTMLDivElement) : THREE.PerspectiveCamera {
	const camera = new THREE.PerspectiveCamera(
		80, container.clientWidth / container.clientHeight, 0.1, 1000)
	camera.position.set(0, 1.35, 0)
	camera.rotation.order = 'YXZ'

	return camera
}