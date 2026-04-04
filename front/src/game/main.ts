import * as THREE from 'three'
import { createScene }   from './scene'
import { createCamera }  from './camera'
import { createControls } from './controls'
import { createPlayer }  from './player'
import { loadWorld }     from './world'
import { createStateExchanger, IPlayerState } from './GameState'
import { createRocketInstance }  from './rocket'
import { createStateExchanger } from './GameState'

let animationId: number
let controlsInstance: ReturnType<typeof createControls> | undefined
let rendererInstance: THREE.WebGLRenderer | undefined
let resizeHandler: (() => void) | undefined

export function startGame(container: HTMLDivElement) {

	const stateExchager = createStateExchanger(1)
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

	const currentState: IPlayerState = {
		user_id: -1, x: 0, y: 0, z: 0
	}
	function stateHandler(state: IPlayerState) {
		if (state.user_id === 1)
			return
		console.log("Received state from user", state.user_id, ":", state);
		// player.setPosition(state.x, state.y, state.z)
	}
	stateExchager.subscribe(stateHandler)

	function animate() {
		animationId = requestAnimationFrame(animate)

		const delta = Math.min(clock.getDelta(), 0.05)  // cap à 50ms pour éviter les bugs physique

		// Met à jour la rotation caméra
		camera.rotation.y = controlsInstance?.getYaw()
		camera.rotation.x = controlsInstance?.getPitch()

		player.update(delta, controlsInstance?.keys, controlsInstance?.getYaw(), worldOctree)
		rendererInstance.render(scene, camera)
		if (i<5)
			console.log(camera);
		i++
		
		camera.rotation.y = controlsInstance.getYaw()
		camera.rotation.x = controlsInstance.getPitch()

		player.update(delta, controlsInstance.keys, controlsInstance.getYaw(), worldOctree)
		rocketInstance.update(scene, camera, controlsInstance.getClick(), delta, worldOctree)

		rendererInstance.render(scene, camera)
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