import { useEffect, useRef, useState } from 'react'
import { startGame, stopGame } from '../game/main'
import { useUserStore } from "@/stores/userStore";
import Loading from "../components/ui_int/Loading";
import NotFound from "./NotFound";
import { useTranslation } from 'react-i18next'

export default function GameMain() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const user = useUserStore((s: any) => s.user);
  const loading = useUserStore((s: any) => s.loading);
  const loadUser = useUserStore((s: any) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!containerRef.current || !user?.id)
      return

    startGame(containerRef.current, user.id)

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
  }, [user?.id])

  if (loading) return <Loading />;
  if (!user) return <NotFound text={t("game_main.server_connection_error")} code={t("game_main.error_code")} />;

  if (!user) return <div>{t("game_main.loading")}</div>;


  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {paused && (
        <div style={{
          position: 'absolute',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(53, 47, 47, 0.5)', color: 'white', fontSize: '2rem'
        }}>
          {t("game_main.pause_click_resume")}
        </div>
      )}
    </div>
  )
}