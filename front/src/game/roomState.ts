import * as THREE from 'three'
import { Capsule } from 'three/addons/math/Capsule.js'

export interface IPlayerState {
    user_id: number;
	pos: [number, number, number]
	rockets?: Array<{ pos: [number, number, number]; rocket_id: number }>;
}

type CreateRocketCallback = () => THREE.Mesh

export function createRoomStateInstance(client_user_id: number, scene: THREE.Scene, createRocket: CreateRocketCallback) {
	const players: Record<number, {mesh: THREE.Mesh; collider: Capsule; target: [number, number, number]}> = {}
	const rockets: Record<number, {user_id: number; mesh: THREE.Mesh; collider: THREE.Sphere; target: [number, number, number]}> = {}

	const SMOOTHING = 50

	function createRemotePlayerMesh(): THREE.Mesh {
		const geometry = new THREE.CapsuleGeometry(0.3, 1)
		const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
		return new THREE.Mesh(geometry, material)
	}

	function disposeMesh(mesh: THREE.Mesh) {
		mesh.geometry?.dispose?.()
		const material = mesh.material as unknown
		if (Array.isArray(material)) {
			for (const m of material) {
				m?.dispose?.()
			}
		} else {
			;(material as any)?.dispose?.()
		}
	}

	function smoothMove(mesh: THREE.Mesh, target: [number, number, number], delta: number) {
		const alpha = 1 - Math.exp(-SMOOTHING * delta)
		const x = mesh.position.x
		const y = mesh.position.y
		const z = mesh.position.z
		const tx = target[0]
		const ty = target[1]
		const tz = target[2]
		const dx = tx - x
		const dy = ty - y
		const dz = tz - z

		mesh.position.set(
			x + dx * alpha,
			y + dy * alpha,
			z + dz * alpha,
		)
	}

	function modifyRoomState(playersFromServ: Array<IPlayerState>) {
		const seenUserIds: Record<number, true> = {}
		const seenRocketIds: Record<number, true> = {}
		for (const playerState of playersFromServ) {
			if (!playerState || playerState.user_id === undefined) {
				continue
			}
			seenUserIds[playerState.user_id] = true

			if (playerState.user_id === client_user_id) {
				continue
			}

			let entry = players[playerState.user_id]
			if (!entry) {
				const meshPlayer = createRemotePlayerMesh()
				meshPlayer.position.set(playerState.pos?.[0] ?? 0, playerState.pos?.[1] ?? 0, playerState.pos?.[2] ?? 0)
				const colliderPlayer = new Capsule(
					new THREE.Vector3(0, 0, 0),
					new THREE.Vector3(0, 1, 0),
					0.3
				)
				players[playerState.user_id] = { mesh: meshPlayer, collider: colliderPlayer, target: [0, 0, 0] }
				scene.add(meshPlayer)
				entry = players[playerState.user_id]
			}

			entry.target[0] = playerState.pos?.[0] ?? 0
			entry.target[1] = playerState.pos?.[1] ?? 0
			entry.target[2] = playerState.pos?.[2] ?? 0

			const rocketStates = playerState.rockets
			if (Array.isArray(rocketStates)) {
				for (const rocketState of rocketStates) {
					if (!rocketState) {
						continue
					}

					const rocketId = Number(rocketState.rocket_id ?? 0)
					seenRocketIds[rocketId] = true

					let rocketEntry = rockets[rocketId]
					if (!rocketEntry) {
						const meshRocket = createRocket()
						meshRocket.position.set(
							rocketState.pos?.[0] ?? 0,
							rocketState.pos?.[1] ?? 0,
							rocketState.pos?.[2] ?? 0,
						)
						const colliderRocket = new THREE.Sphere(meshRocket.position.clone(), 0.3)
						rockets[rocketId] = {
							user_id: playerState.user_id,
							mesh: meshRocket,
							collider: colliderRocket,
							target: [meshRocket.position.x, meshRocket.position.y, meshRocket.position.z],
						}
						scene.add(meshRocket)
						rocketEntry = rockets[rocketId]
					}

					rocketEntry.target[0] = rocketState.pos?.[0] ?? 0
					rocketEntry.target[1] = rocketState.pos?.[1] ?? 0
					rocketEntry.target[2] = rocketState.pos?.[2] ?? 0
				}
			}
		}

		for (const userIdStr in players) {
			const userId = Number(userIdStr)
			if (!seenUserIds[userId]) {
				const entry = players[userId]
				if (entry) {
					scene.remove(entry.mesh)
					disposeMesh(entry.mesh)
				}
				delete players[userId]
			}
		}

		for (const rocketIdStr in rockets) {
			const rocketId = Number(rocketIdStr)
			if (!seenRocketIds[rocketId]) {
				const entry = rockets[rocketId]
				if (entry) {
					scene.remove(entry.mesh)
					disposeMesh(entry.mesh)
				}
				delete rockets[rocketId]
			}
		}
	}

	function update(delta: number) {
		for (const userIdStr in players) {
			const userId = Number(userIdStr)
			const entry = players[userId]
			if (!entry)
				continue
			smoothMove(entry.mesh, entry.target, delta)
			entry.collider.set(entry.mesh.position, entry.mesh.position, 0.3)
		}

		for (const rocketIdStr in rockets) {
			const rocketId = Number(rocketIdStr)
			const entry = rockets[rocketId]
			if (!entry) {
				continue
			}
			smoothMove(entry.mesh, entry.target, delta)
			entry.collider.center.copy(entry.mesh.position)
		}
	}

	return { modifyRoomState, update }
}