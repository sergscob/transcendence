import { useEffect, useRef, useState } from 'react'
import { startGame, stopGame } from '../game/main'
import { useUserStore } from "@/stores/userStore"
import Loading from "../components/ui_int/Loading"
import NotFound from "./NotFound";
import API from "@/api/api";
import { useTranslation } from 'react-i18next'
import { ICurrentMatchState } from '@/game/roomState'
import { useParams } from "react-router-dom"
import { GAME_CONFIG } from '../game/gameConfig'
import backgroundImage from "@/assets/images/brick-bg.jpg";
import ButtonClose from "@/components/ui_int/ButtonClose";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

let defaultMatchState: ICurrentMatchState

function resetMatchState() {
	defaultMatchState = {
	current_player: {
		user_id: 0,
		health: 100,
		arms_left: GAME_CONFIG.PLAYER.totalAmmo,
		score: 0,
		is_ready: false,
		is_view: false,
		hit_other_player: false,
		pos: [...GAME_CONFIG.PLAYER.spawnEnd[0]]
	},
	online_players: 1,
	max_players: 10,
	match_status: "waiting",
	isWinner: false,
	time_left: "00:00",
	players_count: 0
	};
}

resetMatchState()

export default function GameMain() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: matchId } = useParams()
  const isView = new URLSearchParams(location.search).has("view")
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [isMatchLoading, setIsMatchLoading] = useState(true)
  const [canStartGame, setCanStartGame] = useState(false)
  const matchStateRef = useRef<ICurrentMatchState>(defaultMatchState)
  const [matchState, setMatchState] = useState<ICurrentMatchState>(defaultMatchState)
  const user = useUserStore((s: any) => s.user)
  const loading = useUserStore((s: any) => s.loading)
  const loadUser = useUserStore((s: any) => s.loadUser)

  const openInSpectatorMode = () => {
    if (!matchId) {
      return
    }

    const spectatorState: ICurrentMatchState = {
      ...defaultMatchState,
      online_players: matchState.online_players,
      current_player: {
        ...defaultMatchState.current_player,
        arms_left: 0,
        score: matchState.current_player.score,
        is_view: true,
        is_ready: true
      },
    }

    matchStateRef.current = spectatorState
    setMatchState(spectatorState)
    setPaused(false)
    navigate(`/game/${matchId}/?view=1`, { replace: true })
  }

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    let cancelled = false

    async function validateMatch() {
      if (!user?.id || !matchId) {
        setIsMatchLoading(false)
        setCanStartGame(false)
        return
      }

      setIsMatchLoading(true)
      setCanStartGame(false)
      try {
        await API.get(`matches/${matchId}/`)
        if (!cancelled) {
          setCanStartGame(true)
          setIsMatchLoading(false)
        }
      } catch (err: any) {
        if (cancelled) {
          return
        }

        setIsMatchLoading(false)
        setCanStartGame(false)
        if (err?.response?.status === 404) {
          navigate('/', { replace: true })
        }
      }
    }

    validateMatch()

    return () => {
      cancelled = true
    }
  }, [user?.id, matchId, navigate])

  const updateMatchState = (s: ICurrentMatchState) => {
    const nextState: ICurrentMatchState = {
      ...s,
    }
    matchStateRef.current = nextState
    setMatchState(nextState)
  }

  useEffect(() => {
    if (isView && !matchStateRef.current.current_player.is_view) {
      const nextState: ICurrentMatchState = {
        ...matchStateRef.current,
        current_player: {
          ...matchStateRef.current.current_player,
          is_view: true
        },
      }
      matchStateRef.current = nextState
      setMatchState(nextState)
    }

    if (!canStartGame || !containerRef.current || !user?.id)
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
  }, [user?.id, matchId, isView, canStartGame])

  if (loading || isMatchLoading) return <Loading />
  if (!user) return <NotFound text={t("game_main.server_connection_error")} code={t("game_main.error_code")} />

  if (matchState?.match_status != "close") {
	return (
		<div className="relative w-screen h-screen overflow-hidden">
		<div ref={containerRef} style={{ width: '100%', height: '100%' }} />
		{paused && (
			<div className="select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/60 px-6 py-4 text-white text-2xl">
			{t("game_main.pause_click_resume")}
			</div>
		)}
		{!paused && (
			<div className="select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-6 py-4 text-white text-2xl">
			+
			</div>
		)}
		{!paused && matchState?.current_player?.hit_other_player && (
			<div className="select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-6 py-4 text-white text-3xl">
			X
			</div>
		)}
		<div className="absolute w-screen bottom-0 bg-black/20 flex pt-2 text-3xl">
			<div className={`ml-2 font-display whitespace-nowrap ${matchState?.current_player.health < 30 ? "text-red-500/50" : "text-white/50"}`}>
      {t("game_main.hud_health")}: {matchState?.current_player?.health.toFixed(0)}%
			</div>
			<div className={`ml-10 font-display whitespace-nowrap ${matchState?.current_player.arms_left < 2 ? "text-red-500/50" : "text-white/50"}`}>
      {t("game_main.hud_arms")}: {matchState.current_player.arms_left}
			</div>
			<div className="ml-10 font-display whitespace-nowrap text-green-500/50">
      {t("game_main.hud_score")}: {matchState?.current_player?.score}
			</div>
			<div className="ml-10 font-display whitespace-nowrap text-yellow-500/50">
      {t("game_main.hud_time")}: {matchState?.time_left}
			</div>
			<div className="ml-10 font-display whitespace-nowrap text-blue-500/50 ">
      {t("game_main.hud_players")}: {matchState?.online_players}
			</div>
		</div>
		</div>
	)
  }

  const won = Boolean(matchState?.isWinner)
  const score = matchState?.current_player?.score ?? 0
  const onlinePlayers = matchState?.online_players ?? 0

  return (
    <div
      className="w-full h-full overflow-y-auto px-4 py-10 flex flex-col items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex flex-col gap-6 w-full max-w-4xl border border-gray-600 rounded-xl p-6 md:p-10 shadow-2xl bg-gray-800 relative">
        <ButtonClose onClose={() => navigate('/')} className="absolute top-4 right-4" />

        <h2 className="font-extrabold text-3xl md:text-5xl text-white text-center tracking-wide mb-2">
          {won ? t("game_main.end_title_win") : t("game_main.end_title_loss")}
        </h2>

        <div className="flex flex-col gap-3 text-gray-200 text-base md:text-lg bg-gray-700 p-6 rounded-lg border border-gray-600 shadow-inner">
          <h3 className={`text-xl md:text-2xl font-bold border-b border-gray-500 pb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
            {won ? t("game_main.end_result_win") : t("game_main.end_result_loss")}
          </h3>
          <p className="leading-relaxed text-gray-300">
            {t("game_main.end_final_score")}: <span className="font-bold text-white">{score}</span>
          </p>
          <p className="leading-relaxed text-gray-300">
            {t("game_main.end_remaining_players")}: <span className="font-bold text-white">{onlinePlayers}</span>
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:justify-center">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg transition cursor-pointer"
            onClick={() => navigate('/')}
          >
            {t("game_main.end_back_main_menu")}
          </button>

          {!won && onlinePlayers > 1 && (
            <button
              type="button"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg transition cursor-pointer"
              onClick={openInSpectatorMode}
            >
              {t("game_main.end_back_spectator")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}