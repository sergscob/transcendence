import { useEffect, useRef, useState } from 'react'
import { startGame, stopGame } from '../game/main'
import { useUserStore } from "@/stores/userStore";
import Loading from "../components/ui_int/Loading";
import NotFound from "./NotFound";
import { useTranslation } from 'react-i18next'
import { ICurrentMatchState } from '@/game/roomState';  
import { useParams } from "react-router-dom";


const defaultMatchState: ICurrentMatchState = {
  current_player: {
    user_id: 0,
    health: 100,
    arms_left: 50,
    score: 0,
    is_ready: false
  },
  online_players: 1,
  max_players: 10,
  match_status: "waiting",
  time_left: "00:00",
  players_count: 0
};

export default function GameMain() {
  const { id: matchId } = useParams();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const matchStateRef = useRef<ICurrentMatchState>(defaultMatchState)
  const [matchState, setMatchState] = useState<ICurrentMatchState>(defaultMatchState)
  const user = useUserStore((s: any) => s.user);
  const loading = useUserStore((s: any) => s.loading);
  const loadUser = useUserStore((s: any) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const updateMatchState = (s: ICurrentMatchState) => {
    const nextState: ICurrentMatchState = {
      ...s,
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
      matchId,
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

      <div className="absolute w-screen bottom-0 bg-black/20 flex pt-2 text-3xl ">
        <div className={`ml-2 font-display whitespace-nowrap ${matchState?.current_player.health < 30 ? "text-red-500/50" : "text-white/50"}`}>
          HEALTH: {matchState?.current_player?.health.toFixed(0)}%
        </div>
        <div className={`ml-10 font-display whitespace-nowrap ${matchState?.current_player.arms_left < 2 ? "text-red-500/50" : "text-white/50"}`}>
          ARMS: {matchState.current_player.arms_left}
        </div>
        <div className="ml-10 font-display whitespace-nowrap text-green-500/50">
          SCORE: {matchState?.current_player?.score}
        </div>
        <div className="ml-10 font-display whitespace-nowrap text-yellow-500/50">
          TIME: {matchState?.time_left}
        </div>
        <div className="ml-10 font-display whitespace-nowrap text-blue-500/50 ">
          PLAYERS: {matchState?.players_count}
        </div>
      </div>
    </div>
  )
}