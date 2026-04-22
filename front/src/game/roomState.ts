import * as THREE from 'three'
import { Capsule } from 'three/addons/math/Capsule.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { GAME_CONFIG, getPlayerCapsuleStartFromEnd, getPlayerSpawnEnd } from './gameConfig'
import { createRocket } from './rocket'
import { getPlayersFromMessage, getMatchState, IMatchState, IPlayerState } from './socketMessage'

export interface ICurrentPlayerState {
	user_id: number;
	health: number;
	arms_left: number;
	score: number;
	is_ready: boolean;
	is_view: boolean;
	hit_other_player: boolean;
	pos: [number, number, number];
	achivement: Array<any>;
}

export interface ICurrentMatchState {
	current_player: ICurrentPlayerState;
	players_count: number;
	time_left: string;
	match_status: string;
	online_players: number;
	max_players: number;
	isWinner: boolean;
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

type sceneInstanceType = {
    scene: THREE.Scene;
    colorSceneSetter: (color: THREE.ColorRepresentation) => void;
    colorSceneGetter: () => THREE.Color;
}

export function createRoomStateInstance(client_user_id: number, sceneInstance: sceneInstanceType) {
	const players: remotePlayersArr = {}
	const rockets: remoteRocketsArr = {}
	const spawnIndex: Record<number, number> = {}
	const rocketColliderSize = new THREE.Vector3(...GAME_CONFIG.ROCKET.colliderSize)
	let gameStarted = false
	let isWinner = false
	let achivement: Array<string> = []
	let screenAcumulator = 0
	let matchState: IMatchState = {
		players_count: 1,
		time_left: "waiting",
		match_status: "waiting",
		online_players: 1,
		max_players: 0
	}
	let playerState: IPlayerState = {
		user_id: client_user_id,
		health: 100,
		score: 0,
		is_ready: false,
		pos: [...GAME_CONFIG.PLAYER.spawnEnd[0]],
		rotation: [0, 0, 0],
		rockets: []
	}

	const remotePlayerLoader = new GLTFLoader()
	let remotePlayerModel: THREE.Object3D | null = null
	let remotePlayerModelPromise: Promise<THREE.Object3D> | null = null

	function getSpawnIndex(user_id: number): number {
		if (Object.keys(spawnIndex).length === 0) {
			return 0
		}
		return spawnIndex[user_id]
	}

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
			.catch((e) => {
				console.log('Error: Creation of the players 3d model (createRemotePlayerMesh)', e)
			})

		return container
	}

	function smoothMove(mesh: THREE.Object3D, target: [number, number, number], rotation: [number, number, number], delta: number) {
		const alpha = 1 - Math.exp(-GAME_CONFIG.REMOTE.smoothing * delta)
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

	function startState(messageObj: any) {
		const playersObj = messageObj?.players
		if (!playersObj || typeof playersObj !== 'object') {
			console.log("Invalid WS message payload: ", matchState)
			return
		}

		const rawPlayers = Object.values(playersObj) as any[]
		if (!Array.isArray(rawPlayers)) {
			console.log("Invalid WS message payload: ", matchState);
			return
		}

		for (const raw of rawPlayers) {
			if (!raw || typeof raw !== 'object' || raw.user_id === undefined) {
				continue
			}

			spawnIndex[Number(raw.user_id)] = Number(raw.index)
		}
		gameStarted = true
	}

	function stopState(messageObj: any) {
		matchState.match_status = "close"

		const playersObj = messageObj?.players
		if (!playersObj || typeof playersObj !== 'object') {
			console.log("Invalid WS message payload: ", matchState)
			return
		}

		const rawPlayers = Object.values(playersObj) as any[]
		if (!Array.isArray(rawPlayers)) {
			console.log("Invalid WS message payload: ", matchState);
			return
		}

		for (const raw of rawPlayers) {
			if (!raw || typeof raw !== 'object' || raw.user_id === undefined) {
				continue
			}
			if (raw.user_id == client_user_id) {
				isWinner = raw?.result == "win"
				achivement = raw?.achievements
			}
		}

	}

	function modifyRoomState(messageObj: any) {
		const seenUserIds: Record<number, boolean> = {}
		const seenRocketIds: Record<number, boolean> = {}
		const playersFromServ = getPlayersFromMessage(messageObj)
		matchState = getMatchState(messageObj)
		for (const remotePlayerState of playersFromServ) {
			if (!remotePlayerState || remotePlayerState.user_id === undefined ||
				(remotePlayerState.health == 0 && remotePlayerState.user_id !== client_user_id)) {
				continue
			}

			seenUserIds[remotePlayerState.user_id] = true
			if (remotePlayerState.user_id === client_user_id) {
				playerState.health = remotePlayerState.health
				playerState.score = remotePlayerState.score
				playerState.pos = remotePlayerState.pos
				continue
			}
			let entry = players[remotePlayerState.user_id]
			const spawnFallback = getPlayerSpawnEnd(getSpawnIndex(remotePlayerState.user_id))
			if (!entry) {
				const meshPlayer = createRemotePlayerMesh()
				meshPlayer.rotation.order = 'YXZ'

				meshPlayer.position.set(
					remotePlayerState.pos?.[0] ?? spawnFallback.x,
					remotePlayerState.pos?.[1] ?? spawnFallback.y,
					remotePlayerState.pos?.[2] ?? spawnFallback.z,
				)
				meshPlayer.rotation.set(
					remotePlayerState.rotation?.[0] ?? 0,
					remotePlayerState.rotation?.[1] ?? 0,
					remotePlayerState.rotation?.[2] ?? 0,
				)

				const end = meshPlayer.position.clone()
				const colliderPlayer = new Capsule(
					getPlayerCapsuleStartFromEnd(end),
					end,
					GAME_CONFIG.PLAYER.capsule.radius,
				)

				players[remotePlayerState.user_id] = {
					mesh: meshPlayer,
					collider: colliderPlayer,
					target: [meshPlayer.position.x, meshPlayer.position.y, meshPlayer.position.z],
					rotation: [meshPlayer.rotation.x, meshPlayer.rotation.y, meshPlayer.rotation.z]
				}
				sceneInstance.scene.add(meshPlayer)
				entry = players[remotePlayerState.user_id]
			}

			entry.target[0] = remotePlayerState.pos?.[0] ?? spawnFallback.x
			entry.target[1] = remotePlayerState.pos?.[1] ?? spawnFallback.y
			entry.target[2] = remotePlayerState.pos?.[2] ?? spawnFallback.z
			entry.rotation[0] = remotePlayerState.rotation?.[0] ?? 0
			entry.rotation[1] = remotePlayerState.rotation?.[1] ?? 0
			entry.rotation[2] = remotePlayerState.rotation?.[2] ?? 0

			const rocketStates = remotePlayerState.rockets
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
							user_id: remotePlayerState.user_id,
							mesh: meshRocket,
							collider: colliderRocket,
							localBox,
							target: [meshRocket.position.x, meshRocket.position.y, meshRocket.position.z],
							rotation: [meshRocket.rotation.x, meshRocket.rotation.y, meshRocket.rotation.z]
						}
						sceneInstance.scene.add(meshRocket)
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
					sceneInstance.scene.remove(entry.mesh)
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
					sceneInstance.scene.remove(entry.mesh)
					disposeMesh(entry.mesh)
				}
				delete rockets[rocketId]
			}
		}
	}

	function update(delta: number, currentMatchState: ICurrentMatchState, teleportPlayer: (position: THREE.Vector3) => void) {
		screenAcumulator += delta
		for (const userIdStr in players) {
			const userId = Number(userIdStr)
			const entry = players[userId]
			if (!entry)
				continue
			smoothMove(entry.mesh, entry.target, entry.rotation, delta)
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

		currentMatchState.online_players = matchState.online_players
		currentMatchState.time_left = matchState.time_left
		currentMatchState.match_status = matchState.match_status
		currentMatchState.isWinner = isWinner
		currentMatchState.current_player.score = playerState.score
		currentMatchState.current_player.pos = playerState.pos
		currentMatchState.current_player.achivement = achivement
		if (currentMatchState.current_player.health > playerState.health) {
			sceneInstance.colorSceneSetter(0xff0000)
			screenAcumulator = 0
		} else if (sceneInstance.colorSceneGetter().equals(new THREE.Color(0xff0000)) && screenAcumulator > 0.4 && playerState.health) {
			sceneInstance.colorSceneSetter(0xffffff)
		}
		currentMatchState.current_player.health = playerState.health

		if (gameStarted) {
			const index = getSpawnIndex(client_user_id)
			teleportPlayer(getPlayerSpawnEnd(index))
			gameStarted = false
			currentMatchState.current_player.arms_left = GAME_CONFIG.PLAYER.totalAmmo
		}
	}

	return { modifyRoomState, startState, stopState, update, getSpawnIndex, players }
}