type MobileControlName = 'forward' | 'back' | 'left' | 'right' | 'jump' | 'shoot'

function getMobileControl(root: HTMLElement | null, name: MobileControlName) {
	return root?.querySelector<HTMLElement>(`[data-mobile-control="${name}"]`) ?? null
}

export function createControls(container: HTMLDivElement, isMobile = false) {
	const keys: Record<string, boolean> = {}
	let click = false
	let yaw = 0
	let pitch = 0
	const cleanup: Array<() => void> = []
	let activeLookPointerId: number | null = null
	let lastLookX = 0
	let lastLookY = 0
	const mobileRoot = container.parentElement

	const setKey = (code: string, pressed: boolean) => {
		keys[code] = pressed
	}

	const onClick = () => {
		if (isMobile) return
		container.requestPointerLock()
	}

	const onClickInWindow = () => {
		if (document.pointerLockElement !== container) return
		click = true
	}

	const onMouseMove = (e: MouseEvent) => {
		if (document.pointerLockElement !== container) return
		yaw -= e.movementX * 0.002
		pitch -= e.movementY * 0.002
		pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch))
	}

	const onKeyDown = (e: KeyboardEvent) => {
		if (document.pointerLockElement !== container) return
		setKey(e.code, true)
	}

	const onKeyUp = (e: KeyboardEvent) => {
		if (document.pointerLockElement !== container) return
		setKey(e.code, false)
	}

	const bindHoldButton = (name: MobileControlName, code: string) => {
		const element = getMobileControl(mobileRoot, name)
		if (!element) return

		const onPointerDown = (event: PointerEvent) => {
			event.preventDefault()
			setKey(code, true)
		}

		const onPointerUp = (event: PointerEvent) => {
			event.preventDefault()
			setKey(code, false)
		}

		element.addEventListener('pointerdown', onPointerDown)
		element.addEventListener('pointerup', onPointerUp)
		element.addEventListener('pointercancel', onPointerUp)
		element.addEventListener('pointerleave', onPointerUp)
		element.addEventListener('contextmenu', preventDefault)

		cleanup.push(() => {
			element.removeEventListener('pointerdown', onPointerDown)
			element.removeEventListener('pointerup', onPointerUp)
			element.removeEventListener('pointercancel', onPointerUp)
			element.removeEventListener('pointerleave', onPointerUp)
			element.removeEventListener('contextmenu', preventDefault)
		})
	}

	const bindTapButton = (name: MobileControlName, onTap: () => void) => {
		const element = getMobileControl(mobileRoot, name)
		if (!element) return

		const onPointerDown = (event: PointerEvent) => {
			event.preventDefault()
			onTap()
		}

		element.addEventListener('pointerdown', onPointerDown)
		element.addEventListener('contextmenu', preventDefault)

		cleanup.push(() => {
			element.removeEventListener('pointerdown', onPointerDown)
			element.removeEventListener('contextmenu', preventDefault)
		})
	}

	const onTouchPointerDown = (event: PointerEvent) => {
		if (event.pointerType === 'mouse') return
		if (event.target instanceof HTMLElement && event.target.closest('[data-mobile-control]')) return

		activeLookPointerId = event.pointerId
		lastLookX = event.clientX
		lastLookY = event.clientY
		container.setPointerCapture(event.pointerId)
		event.preventDefault()
	}

	const onTouchPointerMove = (event: PointerEvent) => {
		if (activeLookPointerId !== event.pointerId) return

		yaw -= (event.clientX - lastLookX) * 0.004
		pitch -= (event.clientY - lastLookY) * 0.004
		pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch))
		lastLookX = event.clientX
		lastLookY = event.clientY
		event.preventDefault()
	}

	const onTouchPointerUp = (event: PointerEvent) => {
		if (activeLookPointerId !== event.pointerId) return

		activeLookPointerId = null
		if (container.hasPointerCapture(event.pointerId)) {
			container.releasePointerCapture(event.pointerId)
		}
		event.preventDefault()
	}

	if (isMobile) {
		container.addEventListener('pointerdown', onTouchPointerDown)
		container.addEventListener('pointermove', onTouchPointerMove)
		container.addEventListener('pointerup', onTouchPointerUp)
		container.addEventListener('pointercancel', onTouchPointerUp)
		container.addEventListener('contextmenu', preventDefault)

		bindHoldButton('forward', 'KeyW')
		bindHoldButton('back', 'KeyS')
		bindHoldButton('left', 'KeyA')
		bindHoldButton('right', 'KeyD')
		bindHoldButton('jump', 'Space')
		bindTapButton('shoot', () => {
			click = true
		})

		cleanup.push(() => {
			container.removeEventListener('pointerdown', onTouchPointerDown)
			container.removeEventListener('pointermove', onTouchPointerMove)
			container.removeEventListener('pointerup', onTouchPointerUp)
			container.removeEventListener('pointercancel', onTouchPointerUp)
			container.removeEventListener('contextmenu', preventDefault)
		})
	} else {
		container.addEventListener('click', onClick)
		document.addEventListener('mousemove', onMouseMove)
		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		window.addEventListener('click', onClickInWindow)
	}

	function getYaw() {
		return yaw
	}

	function getPitch() {
		return pitch
	}

	function getClick() {
		const result = click
		click = false
		return result
	}

	function destroy() {
		if (isMobile) {
			cleanup.forEach((remove) => remove())
			cleanup.length = 0
			if (activeLookPointerId !== null && container.hasPointerCapture(activeLookPointerId)) {
				container.releasePointerCapture(activeLookPointerId)
			}
			activeLookPointerId = null
			return
		}

		container.removeEventListener('click', onClick)
		document.removeEventListener('mousemove', onMouseMove)
		window.removeEventListener('keydown', onKeyDown)
		window.removeEventListener('keyup', onKeyUp)
		window.removeEventListener('click', onClickInWindow)
	}

	return { getClick, keys, getYaw, getPitch, destroy }
}

function preventDefault(event: Event) {
	event.preventDefault()
}
