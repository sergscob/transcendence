import { useEffect, useRef, useState } from 'react'
import { startGame, stopGame } from '../game/main'
import { useUserStore } from "@/stores/userStore";
import Loading from "../components/ui_int/Loading";
import NotFound from "./NotFound";
import { useTranslation } from 'react-i18next'
import { IMatchState } from '@/game/roomState';  

const defaultMatchState: IMatchState = {
  current_player: {
    user_id: 0,
    health: 100,
    arms_left: 5,
    score: 0,
  },
  players_count: 1,
  time_left: "00:00",
};

export default function GameMain() {

  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const matchStateRef = useRef<IMatchState>(defaultMatchState)
  const [matchState, setMatchState] = useState<IMatchState>(defaultMatchState)
  const user = useUserStore((s: any) => s.user);
  const loading = useUserStore((s: any) => s.loading);
  const loadUser = useUserStore((s: any) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const updateMatchState = (s: IMatchState) => {
    const nextState: IMatchState = {
      ...matchState,
    }
    matchStateRef.current = nextState
    setMatchState(nextState)
  }

  useEffect(() => {
    if (!containerRef.current || !user?.id)
      return

    startGame(
      containerRef.current,
      user.id,
      () => matchStateRef.current,
      updateMatchState,
    )

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
    <div className="relative w-screen h-screen overflow-hidden">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {paused && (
        <div className="absolute flex items-center justify-center bg-black/50 text-white text-2xl">
          {t("game_main.pause_click_resume")}
        </div>
      )}

      <div className="absolute w-screen bottom-0 overflow-hidden bg-black/20 h-12 flex pt-2 ">
        <div className={`font-display text-3xl ${matchState?.current_player.health < 30 ? "text-red-500/50" : "text-white/50"}`}>
          HEALTH: {matchState?.current_player?.health}%
        </div>
        <div className={`ml-10 font-display text-3xl ${matchState?.current_player.arms_left < 2 ? "text-red-500/50" : "text-white/50"}`}>
          ARMS: {matchState.current_player.arms_left}
        </div>
        <div className="ml-10 font-display  text-green-500/50 text-3xl">
          SCORE: {matchState?.current_player?.score}
        </div>
        <div className="ml-10 font-display  text-yellow-500/50 text-3xl">
          TIME LEFT: {matchState?.time_left}
        </div>
        <div className="ml-10 mr-10 font-display text-blue-500/50 text-3xl">
          PLAYERS: {matchState?.players_count}
        </div>
      </div>
    </div>
  )
}