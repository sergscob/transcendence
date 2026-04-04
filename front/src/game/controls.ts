import * as THREE from 'three'

export function createControls(container: HTMLDivElement) {
	const keys: Record<string, boolean> = {}
	let click: boolean = false
	let yaw = 0
	let pitch = 0

	const onClick = () => container.requestPointerLock()

	const onClickInWindow = () => {
		if (document.pointerLockElement !== container) return
		click = true
	}

	// const onPointerLockChange = () => {
	// 	if (document.pointerLockElement !== container) return
	// 	Object.keys(keys).forEach(key => keys[key] = false)
	// }

	const onMouseMove = (e: MouseEvent) => {
		if (document.pointerLockElement !== container) return
		yaw   -= e.movementX * 0.002
		pitch -= e.movementY * 0.002
		pitch  = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch))
	}

	const onKeyDown = (e: KeyboardEvent) => {
		if (document.pointerLockElement !== container) return
		keys[e.code] = true
	}
	const onKeyUp   = (e: KeyboardEvent) => {
		if (document.pointerLockElement !== container) return
		keys[e.code] = false
	}

	container.addEventListener('click', onClick)
	// document.addEventListener('pointerlockchange', onPointerLockChange)
	document.addEventListener('mousemove', onMouseMove)
	window.addEventListener('keydown', onKeyDown)
	window.addEventListener('keyup', onKeyUp)
	window.addEventListener('click', onClickInWindow)

	function getYaw()   { return yaw }
	function getPitch() { return pitch }
	
	function getClick() {
		const result = click
		click = false
		return result
	}

	function destroy() {
		container.removeEventListener('click', onClick)
		document.removeEventListener('mousemove', onMouseMove)
		window.removeEventListener('keydown', onKeyDown)
		window.removeEventListener('keyup', onKeyUp)
		window.removeEventListener('click', onClickInWindow)
		// document.removeEventListener('pointerlockchange', onPointerLockChange)
	}

	return { getClick, keys, getYaw, getPitch, destroy }
}