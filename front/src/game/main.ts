import * as THREE 					from 'three'
import {createScene}   				from './scene'
import {createCamera}  				from './camera'
import {createRocketInstance}		from './rocket'
import {createControls} 			from './controls'
import {createPlayer}  				from './player'
import {loadWorld}     				from './world'
import {createStateExchanger}		from './stateExchanger'
import {setResizeEvent} 			from './window'
import {createRoomStateInstance,
		ICurrentMatchState}			from './roomState'
import { GAME_CONFIG } from './gameConfig'

let animationId: number
let controlsInstance: ReturnType<typeof createControls> | undefined
let rendererInstance: THREE.WebGLRenderer | undefined
let removeResizeInstance: {removeResizeEvent: () => void} | undefined

export function startGame(container: HTMLDivElement,
	user_id: number,
	matchId: string | undefined,
	getMatchState: () => ICurrentMatchState,
	setMatchState: (state: ICurrentMatchState) => void
	) {
	if (!matchId) 
		matchId = "default"

	rendererInstance = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
	controlsInstance = createControls(container)
	const camera   = createCamera(container)
	removeResizeInstance = setResizeEvent(rendererInstance, camera, container)
	const scene    = createScene()
	const worldOctree = loadWorld(scene)
	const roomState = createRoomStateInstance(user_id, scene)
	const stateExchanger = createStateExchanger(user_id, matchId, roomState.modifyRoomState, roomState.startState, roomState.stopState)
	const player = createPlayer(camera, stateExchanger.sendShot, user_id, roomState.getSpawnIndex, getMatchState())
	const rockets = createRocketInstance(user_id, stateExchanger.sendShot)
	const SEND_INTERVAL = 0.016
	let sendAccumulator = 0
	const posBuffer: [number, number, number] = [...GAME_CONFIG.PLAYER.spawnEnd[0]]
	const rotationBuffer: [number, number, number] = [0, 0, 0]

	const clock = new THREE.Clock()
	function animate() {
		const matchState = getMatchState()
		animationId = requestAnimationFrame(animate)

		const delta = Math.min(clock.getDelta(), 0.05)

		roomState.update(delta, matchState, player.teleportPlayer)
		player.update(delta, controlsInstance?.keys ?? {}, controlsInstance?.getYaw() ?? 0, worldOctree)
		rockets.update(scene, camera, controlsInstance?.getClick() ?? false, delta, worldOctree, roomState.players, matchState)

		camera.rotation.y = controlsInstance?.getYaw() ?? 0
		camera.rotation.x = controlsInstance?.getPitch() ?? 0

		sendAccumulator += delta
		if (sendAccumulator >= SEND_INTERVAL) {
			sendAccumulator = 0
			posBuffer[0] = camera.position.x
			posBuffer[1] = camera.position.y
			posBuffer[2] = camera.position.z
			rotationBuffer[0] = camera.rotation.x
			rotationBuffer[1] = camera.rotation.y
			rotationBuffer[2] = camera.rotation.z
			stateExchanger.sendState({
				pos: posBuffer,
				rotation: rotationBuffer,
				rockets: rockets.state(),
			})
		}

		matchState.current_player.pos = posBuffer
		setMatchState(matchState)
		rendererInstance?.render(scene, camera)
	}

	animate()
}

export function stopGame() {
	removeResizeInstance.removeResizeEvent()
	controlsInstance?.destroy()
	cancelAnimationFrame(animationId)

	if (rendererInstance) {
		rendererInstance.dispose()
		const canvas = rendererInstance.domElement
		if (canvas.parentNode)
			canvas.parentNode.removeChild(canvas)
		rendererInstance = undefined
	}
}