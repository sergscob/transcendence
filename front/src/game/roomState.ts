import * as THREE from 'three'
import { Capsule } from 'three/addons/math/Capsule.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { GAME_CONFIG, getPlayerCapsuleStartFromEnd, getPlayerSpawnEnd } from './gameConfig'
import { createRocket } from './rocket'

export interface IPlayerState {
    user_id: number;
	pos: [number, number, number];
	rotation: [number, number, number];
	rockets?: Array<{ pos: [number, number, number]; rotation: [number, number, number]; rocket_id: number }>;
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
	online_players: number;
	max_players: number;
}

export type remotePlayersArr = Record<number, {
	mesh: THREE.Object3D;
	collider: Capsule;
	target: [number, number, number];
	rotation: [number, number, number]
}>
export type remoteRocketsArr = Record<number, {
	user_id: number;
	mesh: THREE.Mesh;
	collider: THREE.Box3;
	localBox: THREE.Box3;
	target: [number, number, number];
	rotation: [number, number, number]
}>

export function createRoomStateInstance(client_user_id: number, scene: THREE.Scene) {
	const players: remotePlayersArr = {}
	const rockets: remoteRocketsArr = {}
	const rocketColliderSize = new THREE.Vector3(...GAME_CONFIG.ROCKET.colliderSize)

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

	function disposeObject3D(obj: THREE.Object3D) {
		obj.traverse((child) => {
			const anyChild = child as unknown as { isMesh?: boolean }
			if (!anyChild?.isMesh) {
				return
			}
			disposeMesh(child as unknown as THREE.Mesh)
		})
	}

	function recolorObject(obj: THREE.Object3D, colorHex: number) {
		obj.traverse((child) => {
			const anyChild = child as unknown as { isMesh?: boolean }
			if (!anyChild?.isMesh) {
				return
			}

			const mesh = child as unknown as THREE.Mesh
			const recolorMaterial = (material: THREE.Material) => {
				const cloned = material.clone()
				const matAny = cloned as unknown as { color?: THREE.Color }
				if (matAny.color && matAny.color instanceof THREE.Color) {
					matAny.color.setHex(colorHex)
				}
				return cloned
			}

			if (Array.isArray(mesh.material)) {
				mesh.material = mesh.material.map(recolorMaterial)
			} else if (mesh.material) {
				mesh.material = recolorMaterial(mesh.material)
			}
		})
	}

	function createWeaponAttachment(box: THREE.Box3) {
		const size = new THREE.Vector3()
		box.getSize(size)
		const center = new THREE.Vector3()
		box.getCenter(center)

		const barrelLength = Math.max(0.15, size.z * 0.25)
		const barrelRadius = Math.max(0.015, Math.min(size.x, size.y) * 0.06)
		const barrelGeometry = new THREE.CylinderGeometry(barrelRadius, barrelRadius, barrelLength, 10, 1)
		barrelGeometry.rotateX(Math.PI / 2)

		const barrelMaterial = new THREE.MeshLambertMaterial({ color: GAME_CONFIG.REMOTE.playerMeshColor })
		const barrelMesh = new THREE.Mesh(barrelGeometry, barrelMaterial)
		barrelMesh.position.set(center.x, center.y + 1.95, box.min.z - barrelLength / 2 - barrelRadius * 0.5 + 0.7)

		const mountSize = barrelRadius * 2.2
		const mountGeometry = new THREE.BoxGeometry(mountSize, mountSize, mountSize)
		const mountMaterial = new THREE.MeshLambertMaterial({ color: GAME_CONFIG.REMOTE.playerMeshColor })
		const mountMesh = new THREE.Mesh(mountGeometry, mountMaterial)
		mountMesh.position.set(center.x, center.y + 1.95, box.min.z + mountSize * 0.2 + 0.7)

		const weapon = new THREE.Group()
		weapon.add(mountMesh)
		weapon.add(barrelMesh)
		return weapon
	}

	function createRemotePlayerMesh(): THREE.Object3D {
		const container = new THREE.Group()
		container.userData._destroyed = false
		container.rotation.order = 'YXZ'

		loadRemotePlayerModel()
			.then((model) => {
				if (container.userData._destroyed) {
					return
				}
				const clone = model.clone(true)
				clone.position.set(0, 0, 0)
				clone.scale.setScalar(0.8)
				clone.rotateY(Math.PI)

				const box = new THREE.Box3().setFromObject(clone)
				const capsuleBottomY = -(GAME_CONFIG.PLAYER.capsule.height - 0.2)
				clone.position.y += capsuleBottomY - box.min.y

				recolorObject(clone, GAME_CONFIG.REMOTE.playerMeshColor)
				const finalBox = new THREE.Box3().setFromObject(clone)
				clone.add(createWeaponAttachment(finalBox))

				container.add(clone)
			})
			.catch(() => {
				console.log('Error: Creation of the players 3d model (createRemotePlayerMesh)')
			})

		return container
	}

	function smoothMove(mesh: THREE.Object3D, target: [number, number, number], rotation: [number, number, number], delta: number, invertPitch = false) {
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

		mesh.rotation.set(
			rotation[0],
			rotation[1],
			rotation[2],
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
				meshPlayer.rotation.order = 'YXZ'
				const spawnFallback = getPlayerSpawnEnd()

				meshPlayer.position.set(
					playerState.pos?.[0] ?? spawnFallback.x,
					playerState.pos?.[1] ?? spawnFallback.y,
					playerState.pos?.[2] ?? spawnFallback.z,
				)
				meshPlayer.rotation.set(
					playerState.rotation?.[0] ?? 0,
					playerState.rotation?.[1] ?? 0,
					playerState.rotation?.[2] ?? 0,
				)

				const end = meshPlayer.position.clone()
				const colliderPlayer = new Capsule(
					getPlayerCapsuleStartFromEnd(end),
					end,
					GAME_CONFIG.PLAYER.capsule.radius,
				)

				players[playerState.user_id] = {
					mesh: meshPlayer,
					collider: colliderPlayer,
					target: [meshPlayer.position.x, meshPlayer.position.y, meshPlayer.position.z],
					rotation: [meshPlayer.rotation.x, meshPlayer.rotation.y, meshPlayer.rotation.z]
				}
				scene.add(meshPlayer)
				entry = players[playerState.user_id]
			}

			entry.target[0] = playerState.pos?.[0] ?? 0
			entry.target[1] = playerState.pos?.[1] ?? 0
			entry.target[2] = playerState.pos?.[2] ?? 0
			entry.rotation[0] = playerState.rotation?.[0] ?? 0
			entry.rotation[1] = playerState.rotation?.[1] ?? 0
			entry.rotation[2] = playerState.rotation?.[2] ?? 0

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
						meshRocket.rotation.set(
							rocketState.rotation?.[0] ?? 0,
							rocketState.rotation?.[1] ?? 0,
							rocketState.rotation?.[2] ?? 0,
						)
						const localBox = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0, 0, 0), rocketColliderSize)
						meshRocket.updateMatrixWorld(true)
						const colliderRocket = localBox.clone().applyMatrix4(meshRocket.matrixWorld)
						rockets[rocketId] = {
							user_id: playerState.user_id,
							mesh: meshRocket,
							collider: colliderRocket,
							localBox,
							target: [meshRocket.position.x, meshRocket.position.y, meshRocket.position.z],
							rotation: [meshRocket.rotation.x, meshRocket.rotation.y, meshRocket.rotation.z]
						}
						scene.add(meshRocket)
						rocketEntry = rockets[rocketId]
					}

					rocketEntry.target[0] = rocketState.pos?.[0] ?? 0
					rocketEntry.target[1] = rocketState.pos?.[1] ?? 0
					rocketEntry.target[2] = rocketState.pos?.[2] ?? 0
					rocketEntry.rotation[0] = rocketState.rotation?.[0] ?? 0
					rocketEntry.rotation[1] = rocketState.rotation?.[1] ?? 0
					rocketEntry.rotation[2] = rocketState.rotation?.[2] ?? 0
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
					disposeObject3D(entry.mesh)
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
			smoothMove(entry.mesh, entry.target, entry.rotation, delta, true)
			const end = entry.mesh.position.clone()
			entry.collider.set(getPlayerCapsuleStartFromEnd(end), end, GAME_CONFIG.PLAYER.capsule.radius)
		}

		for (const rocketIdStr in rockets) {
			const rocketId = Number(rocketIdStr)
			const entry = rockets[rocketId]
			if (!entry) {
				continue
			}
			smoothMove(entry.mesh, entry.target, entry.rotation, delta)
			entry.mesh.updateMatrixWorld(true)
			entry.collider.copy(entry.localBox).applyMatrix4(entry.mesh.matrixWorld)
		}
	}

	return { modifyRoomState, update, players }
}