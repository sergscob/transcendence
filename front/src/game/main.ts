import * as THREE from 'three'
import { createScene }   from './scene'
import { createCamera }  from './camera'
import { createControls } from './controls'
import { createPlayer }  from './player'
import { loadWorld }     from './world'

let animationId: number
let controlsInstance: ReturnType<typeof createControls>

export function startGame(container: HTMLDivElement) {
	const scene    = createScene()
	const camera   = createCamera(container)
	const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
	const controlsInstance = createControls(container)
	const player   = createPlayer(camera)
	const worldOctree = loadWorld(scene)

	renderer.setSize(container.clientWidth, container.clientHeight)
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.shadowMap.enabled = true
	container.appendChild(renderer.domElement)

	const clock = new THREE.Clock()

	function animate() {
		animationId = requestAnimationFrame(animate)

		const delta = Math.min(clock.getDelta(), 0.05)  // cap à 50ms pour éviter les bugs physique

		// Met à jour la rotation caméra
		camera.rotation.y = controlsInstance.getYaw()
		camera.rotation.x = controlsInstance.getPitch()

		player.update(delta, controlsInstance.keys, controlsInstance.getYaw(), worldOctree)
		renderer.render(scene, camera)
	}

	animate()
}

export function stopGame() {
	controlsInstance?.destroy()
	cancelAnimationFrame(animationId)
}