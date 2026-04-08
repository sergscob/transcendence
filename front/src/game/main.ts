import * as THREE 				from 'three'
import {createScene}   			from './scene'
import {createCamera}  			from './camera'
import {createControls} 		from './controls'
import {createPlayer}  			from './player'
import {loadWorld}     			from './world'
import {createRocketInstance}	from './rocket'
import {createStateExchanger} 	from './stateExchanger'
import {createRoomStateInstance}from './roomState'
import { IMatchState } from './roomState'

let animationId: number
let controlsInstance: ReturnType<typeof createControls> | undefined
let rendererInstance: THREE.WebGLRenderer | undefined
let resizeHandler: (() => void) | undefined

export function startGame(
	container: HTMLDivElement,
	user_id: number,
	getMatchState: () => IMatchState,
	setMatchState: (state: IMatchState) => void,
) {
	rendererInstance = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
	controlsInstance = createControls(container)
	const scene    = createScene()
	const worldOctree = loadWorld(scene)
	const camera   = createCamera(container)
	const player = createPlayer(camera)
	const rockets = createRocketInstance(user_id)
	const roomState = createRoomStateInstance(user_id, scene, rockets.createRocket)
	const stateExchanger = createStateExchanger(user_id, roomState.modifyRoomState)
	const SEND_INTERVAL = 0.016
	let sendAccumulator = 0
	const posBuffer: [number, number, number] = [0, 0, 0]
	const rotationBuffer: [number, number, number] = [0, 0, 0]

	resizeHandler = () => {
		if (!rendererInstance)
			return
		camera.aspect = container.clientWidth / container.clientHeight
		camera.updateProjectionMatrix()
		rendererInstance.setSize(container.clientWidth, container.clientHeight)
		rendererInstance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	}

	rendererInstance.shadowMap.enabled = true
	container.appendChild(rendererInstance.domElement)
	resizeHandler()
	window.addEventListener('resize', resizeHandler)

	const clock = new THREE.Clock()
	function animate() {
		animationId = requestAnimationFrame(animate)

		const delta = Math.min(clock.getDelta(), 0.05)  // cap à 50ms pour éviter les bugs physique

		player.update(delta, controlsInstance?.keys ?? {}, controlsInstance?.getYaw() ?? 0, worldOctree)

		let launchRocket = controlsInstance?.getClick() ?? false
		if (launchRocket) {
			const matchState = getMatchState()
			const armsLeft = matchState.current_player.arms_left
			if (armsLeft > 0) {
				matchState.current_player.arms_left -= 1
				setMatchState(matchState)
			}
			else
				launchRocket = false
		}

		const hitGroundDamage = player.getHitGroundDamage()
		if (hitGroundDamage > 0) {
			const matchState = getMatchState()
			matchState.current_player.health -= hitGroundDamage
			setMatchState(matchState)
		}

		rockets.update(scene, camera, launchRocket, delta, worldOctree)
		roomState.update(delta)

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
	if (resizeHandler) {
		window.removeEventListener('resize', resizeHandler)
		resizeHandler = undefined
	}

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