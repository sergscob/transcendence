import * as THREE from 'three'

let resizeHandler: (() => void) | undefined

export function setRisizeEvent(rendererInstance: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera, container: HTMLDivElement) {

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

	function removeRisizeEvent() {
		if (resizeHandler) {
			window.removeEventListener('resize', resizeHandler)
			resizeHandler = undefined
		}
	}

	return {removeRisizeEvent}

}