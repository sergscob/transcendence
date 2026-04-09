import * as THREE 				from 'three'
import {createScene}   			from './scene'
import {createCamera}  			from './camera'
import {createControls} 		from './controls'
import {createPlayer}  			from './player'
import {loadWorld}     			from './world'
import {createRocketInstance}	from './rocket'
import {createStateExchanger} 	from './stateExchanger'
import {setRisizeEvent} 	from './window'
import {createRoomStateInstance, IMatchState}from './roomState'

let animationId: number
let controlsInstance: ReturnType<typeof createControls> | undefined
let rendererInstance: THREE.WebGLRenderer | undefined
let removeResizeInstance: {removeRisizeEvent: () => void} | undefined

export function startGame(container: HTMLDivElement, user_id: number,
	getMatchState: () => IMatchState, setMatchState: (state: IMatchState) => void) {
	rendererInstance = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
	controlsInstance = createControls(container)
	const scene    = createScene()
	const worldOctree = loadWorld(scene)
	const camera   = createCamera(container)
	removeResizeInstance = setRisizeEvent(rendererInstance, camera, container)
	const player = createPlayer(camera)
	const rockets = createRocketInstance(user_id)
	const roomState = createRoomStateInstance(user_id, scene, rockets.createRocket)
	const stateExchanger = createStateExchanger(user_id, roomState.modifyRoomState)
	const SEND_INTERVAL = 0.016
	let sendAccumulator = 0
	const posBuffer: [number, number, number] = [0, 0, 0]
	const rotationBuffer: [number, number, number] = [0, 0, 0]

	const clock = new THREE.Clock()
	function animate() {
		const matchState = getMatchState()
		animationId = requestAnimationFrame(animate)

		const delta = Math.min(clock.getDelta(), 0.05)

		player.update(delta, controlsInstance?.keys ?? {}, controlsInstance?.getYaw() ?? 0, worldOctree, matchState)
		roomState.update(delta)
		rockets.update(scene, camera, controlsInstance?.getClick() ?? false, delta, worldOctree, roomState.players, matchState)

		matchState.players_count = Object.keys(roomState.players).length
		// matchState.time_left = clock.getElapsedTime()
		setMatchState(matchState)

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

		rendererInstance?.render(scene, camera)
	}

	animate()
}

export function stopGame() {
	removeResizeInstance.removeRisizeEvent()
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