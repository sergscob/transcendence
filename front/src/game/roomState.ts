import * as THREE from 'three'

export function createRoomStateInstance(scene: THREE.Scene) {
	const players: Array<{mesh: THREE.Mesh, collider: THREE.Sphere}> = []
	// const rockets: Array<{mesh: THREE.Mesh, collider: THREE.Sphere}> = []

	function modifyRoomState() {
		
	}

	return {modifyRoomState}
}