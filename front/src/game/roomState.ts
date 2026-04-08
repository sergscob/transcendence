import * as THREE from 'three'
import { Capsule } from 'three/addons/math/Capsule.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

import { GAME_CONFIG, getPlayerCapsuleStartFromEnd, getPlayerSpawnEnd } from './gameConfig'

export interface IPlayerState {
    user_id: number;
	pos: [number, number, number];
	rockets?: Array<{ pos: [number, number, number]; rocket_id: number }>;
}

export interface ICurrentPlayerState {
	user_id: number;
	health: number;
	arms_left: number;
	score: number;
	is_ready: boolean;
	position: [number, number, number];
}

export interface IMatchState {
	current_player: ICurrentPlayerState;
	players_count: number;
	time_left: string;
	match_status: string;
}

type CreateRocketCallback = () => THREE.Mesh

export function createRoomStateInstance(client_user_id: number, scene: THREE.Scene, createRocket: CreateRocketCallback) {
	const players: Record<number, {mesh: THREE.Object3D; collider: Capsule; target: [number, number, number]}> = {}
	const rockets: Record<number, {user_id: number; mesh: THREE.Mesh; collider: THREE.Sphere; target: [number, number, number]}> = {}

	const SMOOTHING = GAME_CONFIG.REMOTE.smoothing

	const remotePlayerLoader = new GLTFLoader()
	let remotePlayerModel: THREE.Object3D | null = null
	let remotePlayerModelPromise: Promise<THREE.Object3D> | null = null

	function loadRemotePlayerModel(): Promise<THREE.Object3D> {
		if (remotePlayerModel) {
			return Promise.resolve(remotePlayerModel)
		}
		if (remotePlayerModelPromise) {
			return remotePlayerModelPromise
		}
		remotePlayerModelPromise = new Promise<THREE.Object3D>((resolve, reject) => {
			remotePlayerLoader.load(
				'/models/cartoonish_flying_robot.glb',
				(gltf) => {
					remotePlayerModel = gltf.scene
					resolve(remotePlayerModel)
				},
				undefined,
				(err) => reject(err),
			)
		}).finally(() => {
			remotePlayerModelPromise = null
		})
		return remotePlayerModelPromise
	}

	function disposeMesh(mesh: THREE.Mesh) {
		mesh.geometry?.dispose?.()
		const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
		for (const material of materials) {
			material?.dispose?.()
		}
	}

	function createRemotePlayerMesh(): THREE.Object3D {
		const container = new THREE.Group()
		container.userData._destroyed = false

		loadRemotePlayerModel()
			.then((model) => {
				if (container.userData._destroyed) {
					return
				}
				const clone = model.clone(true)
				clone.position.set(0, 0, 0)
				clone.scale.setScalar(0.8)

				// Align model bottom to capsule bottom (container is at collider.end).
				const box = new THREE.Box3().setFromObject(clone)
				const capsuleBottomY = -(GAME_CONFIG.PLAYER.capsule.height - 0.2)
				clone.position.y += capsuleBottomY - box.min.y

				container.add(clone)
			})
			.catch(() => {
				// No-op
			})

		return container
	}

	function smoothMove(mesh: THREE.Object3D, target: [number, number, number], delta: number) {
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
				const spawnFallback = getPlayerSpawnEnd()
				meshPlayer.position.set(
					playerState.pos?.[0] ?? spawnFallback.x,
					playerState.pos?.[1] ?? spawnFallback.y,
					playerState.pos?.[2] ?? spawnFallback.z,
				)
				const end = meshPlayer.position.clone()
				const colliderPlayer = new Capsule(
					getPlayerCapsuleStartFromEnd(end),
					end,
					GAME_CONFIG.PLAYER.capsule.radius,
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
						const colliderRocket = new THREE.Sphere(meshRocket.position.clone(), GAME_CONFIG.ROCKET.colliderRadius)
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
					entry.mesh.userData._destroyed = true
					scene.remove(entry.mesh)
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
			const end = entry.mesh.position.clone()
			entry.collider.set(getPlayerCapsuleStartFromEnd(end), end, GAME_CONFIG.PLAYER.capsule.radius)
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