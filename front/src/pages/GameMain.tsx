import { useEffect, useRef, useState } from 'react'
import { startGame, stopGame } from '../game/main'
import { useUserStore } from "@/stores/userStore";

export default function GameMain() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    if (containerRef.current)
      startGame(containerRef.current, user?.id)
    const onPointerLockChange = () => {
      if (!document.pointerLockElement)
        setPaused(true)   // affiche le menu pause
      else
        setPaused(false)  // cache le menu pause
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)

    return () => {
      stopGame()
      document.removeEventListener('pointerlockchange', onPointerLockChange)
    }
  }, [])

  if (!user) return <div>Loading...</div>;


  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {paused && (
        <div style={{
          position: 'absolute',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(53, 47, 47, 0.5)', color: 'white', fontSize: '2rem'
        }}>
          PAUSE — Clique pour reprendre
        </div>
      )}
    </div>
  )
}