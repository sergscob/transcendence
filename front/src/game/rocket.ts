import * as THREE from 'three'
import { Octree } from 'three/addons/math/Octree.js'
import { GAME_CONFIG } from './gameConfig'
import { remotePlayersArr, ICurrentMatchState }from './roomState'

export function createRocket(): THREE.Mesh {
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

export function createRocketInstance(user_id: number, sendShot: (shot: any) => void) {
	const ROCKET_ID_STRIDE = GAME_CONFIG.ROCKET.idStride
	let loadingAmmoAcumulator = 0
	let waitAmmoAcumulator = 0
	let hitMarkerAcumulator = 0
	let nextRocketNumber = 1
	const rockets: Array<{rocket_id: number, mesh: THREE.Mesh, collider: THREE.Box3, localBox: THREE.Box3}> = []

	const rocketColliderSize = new THREE.Vector3(...GAME_CONFIG.ROCKET.colliderSize)
	const rocketColliderWorldSize = new THREE.Vector3(...GAME_CONFIG.ROCKET.colliderWorldSize)

	function generateRocketId() {
		return user_id * ROCKET_ID_STRIDE + nextRocketNumber++
	}

	function update(
		scene: THREE.Scene,
		camera: THREE.PerspectiveCamera,
		click: boolean,
		delta: number,
		worldOctree: Octree,
		players: remotePlayersArr,
		PlayerGetState: ICurrentMatchState
		) {		
		hitMarkerAcumulator += delta
		if (PlayerGetState.current_player.hit_other_player && hitMarkerAcumulator > 0.4) {
			PlayerGetState.current_player.hit_other_player = false
		}

		for (let i = rockets.length - 1; i >= 0; i--) {
			const rocketMesh = rockets[i].mesh
			const rocketCollider = rockets[i].collider
			const localBox = rockets[i].localBox
			const direction = new THREE.Vector3()
			rocketMesh.getWorldDirection(direction)
			rocketMesh.position.addScaledVector(direction, GAME_CONFIG.ROCKET.speed * delta)

			rocketMesh.updateMatrixWorld(true)
			rocketCollider.copy(localBox).applyMatrix4(rocketMesh.matrixWorld)

			const rocketColliderForWorld = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0, 0), rocketColliderWorldSize)
			rocketColliderForWorld.applyMatrix4(rocketMesh.matrixWorld)
			
			if (rocketMesh.position.length() > GAME_CONFIG.ROCKET.maxDistance || worldOctree.boxIntersect(rocketColliderForWorld)) {
				scene.remove(rocketMesh)
				rockets.splice(i, 1)
				continue
			}

			for (const userIdStr in players) {
				const userId = Number(userIdStr)
				if (players[userId].collider.intersectsBox(rocketCollider)) {
					scene.remove(rocketMesh)
					rockets.splice(i, 1)
					sendShot(userId)
					PlayerGetState.current_player.hit_other_player = true
					hitMarkerAcumulator = 0
				}
			}
		}

		waitAmmoAcumulator += delta

		if (PlayerGetState.current_player.is_view) {
			return
		}

		if (click && PlayerGetState.current_player.arms_left > 0 && waitAmmoAcumulator > 0.5) {
			waitAmmoAcumulator = 0
			PlayerGetState.current_player.arms_left--
			const newRocket = createRocket()
			const rocketId = generateRocketId()
			
			const camDir = new THREE.Vector3()
			camera.getWorldDirection(camDir)

			newRocket.position.copy(camera.position)
			const target = newRocket.position.clone().add(camDir)
			newRocket.lookAt(target)
			const direction = new THREE.Vector3()
			newRocket.getWorldDirection(direction)
			newRocket.position.addScaledVector(direction, 1.1)

			const localBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0, 0), rocketColliderSize)
			newRocket.updateMatrixWorld(true)
			const newCollider = localBox.clone().applyMatrix4(newRocket.matrixWorld)
	
			rockets.push({rocket_id: rocketId, mesh: newRocket, collider: newCollider, localBox})
			scene.add(newRocket)
		}

		if (PlayerGetState.current_player.arms_left <= 0) {
			loadingAmmoAcumulator += delta
			if (loadingAmmoAcumulator >= 2) {
				PlayerGetState.current_player.arms_left = GAME_CONFIG.PLAYER.totalAmmo
				loadingAmmoAcumulator = 0
			}
		}
	}

	function state(): Array<{ pos: Array<number>; rocket_id: number }> {
		return rockets.map(({ rocket_id, mesh }) => ({
			rocket_id,
			pos: mesh.position.toArray(),
			rotation: mesh.rotation.toArray()
		}))
	}

	return {update, state}
} 