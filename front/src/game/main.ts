import * as THREE from 'three'
import { createScene }   from './scene'
import { createCamera }  from './camera'
import { createControls } from './controls'
import { createPlayer }  from './player'
import { loadWorld }     from './world'
import { createStateExchanger, IPlayerState } from './GameState'
import { clearOtherPlayers, updateOtherPlayer } from '../game/others';
import { createRocketInstance }  from './rocket'

let animationId: number
let controlsInstance: ReturnType<typeof createControls> | undefined
let rendererInstance: THREE.WebGLRenderer | undefined
let resizeHandler: (() => void) | undefined

export function startGame(container: HTMLDivElement, user_id: number) {

	const stateExchager = createStateExchanger(user_id)
	const scene    = createScene()
	const camera   = createCamera(container)
	rendererInstance = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
	controlsInstance = createControls(container)
	const player   = createPlayer(camera)
	const worldOctree = loadWorld(scene)
	const rocketInstance = createRocketInstance()

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
	let i = 0;

	const prevState: IPlayerState = {
		user_id: -1, x: 0, y: 0, z: 0
	}
	function stateHandler(state: IPlayerState) {
		if (state.user_id === user_id)
			return
		// console.log("Received state from user", state.user_id, ":", state);
		updateOtherPlayer(state, scene);
	}
	stateExchager.subscribe(stateHandler)

	function animate() {
		animationId = requestAnimationFrame(animate)

		const delta = Math.min(clock.getDelta(), 0.05)  // cap à 50ms pour éviter les bugs physique
		const controls = controlsInstance
		const renderer = rendererInstance

		if (!controls || !renderer)
			return

		camera.rotation.y = controls.getYaw()
		camera.rotation.x = controls.getPitch()

		player.update(delta, controls.keys, controls.getYaw(), worldOctree)
		rocketInstance.update(scene, camera, controls.getClick(), delta, worldOctree)

		renderer.render(scene, camera)

		stateExchager.sendState({
			user_id, 
			x: camera.position.x, 
			y: camera.position.y, 
			z: camera.position.z
		})
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
	clearOtherPlayers()

	if (rendererInstance) {
		rendererInstance.dispose()
		const canvas = rendererInstance.domElement
		if (canvas.parentNode)
			canvas.parentNode.removeChild(canvas)
		rendererInstance = undefined
	}
}