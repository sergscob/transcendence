import { useEffect, useRef, useState } from 'react'
import { mobileAndTabletCheck, startGame, stopGame } from '../game/main'
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
import { getAchivmentMessage } from "@/utils/achivements";
import { toast } from 'react-toastify'

const DATE_FORMAT = "DD.MM.YYYY HH:mm";

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
		pos: [...GAME_CONFIG.PLAYER.spawnEnd[0]],
		achivement: []
	},
	online_players: 1,
	max_players: 10,
	match_status: "waiting",
	isWinner: false,
	time_left: "00:00",
	players_count: 0
	};
}

export default function GameMain() {
  resetMatchState()
  const navigate = useNavigate();
  const location = useLocation();
  const { id: matchId } = useParams()
  const isView = new URLSearchParams(location.search).has("view")
  const isMobile = typeof window !== 'undefined' && mobileAndTabletCheck()
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLandscape, setIsLandscape] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(orientation: landscape)').matches
  )
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
      current_player: {
        ...defaultMatchState.current_player,
        arms_left: 0,
        score: matchState.current_player.score,
        is_view: true,
        is_ready: true,
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
    if (!isMobile) {
      return
    }

    const mediaQuery = window.matchMedia('(orientation: landscape)')
    const updateOrientation = () => {
      setIsLandscape(mediaQuery.matches)
    }

    updateOrientation()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateOrientation)
    } else {
      mediaQuery.addListener(updateOrientation)
    }

    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    if (screen.orientation?.lock) {
      screen.orientation.lock('landscape').catch(() => {
        // Browsers often require fullscreen/user gesture for orientation lock.
      })
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updateOrientation)
      } else {
        mediaQuery.removeListener(updateOrientation)
      }
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [isMobile])

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
    if (matchState?.match_status !== "close") 
      return

    const achievements = matchState?.current_player?.achivement ?? []

    achievements.forEach((achievement: any) => {
      toast(getAchivmentMessage(achievement), {
          autoClose: 5000,
          style: {
            fontFamily: 'Black Ops One, system-ui, sans-serif',
            background: '#385080',
            color: '#ffffff',
            fontSize: '1.5rem',
            lineHeight: 1.3,
          },
        }
      )
    })
  }, [matchState?.match_status, matchState?.current_player?.achivement])

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

    if (loading || isMatchLoading || !canStartGame || !containerRef.current || !user?.id || (isMobile && !isLandscape))
      return

    startGame(
      containerRef.current,
      user.id,
      matchId,
      () => matchStateRef.current,
      updateMatchState,
      { mobile: isMobile },
    )

    const onPointerLockChange = () => {
      if (!document.pointerLockElement)
        setPaused(true)
      else
        setPaused(false)
    }

    if (!isMobile) {
      document.addEventListener('pointerlockchange', onPointerLockChange)
    }

    return () => {
      stopGame()
      if (!isMobile) {
        document.removeEventListener('pointerlockchange', onPointerLockChange)
      }
    }
  }, [user?.id, matchId, isView, canStartGame, loading, isMatchLoading, isMobile, isLandscape])

  if (loading || isMatchLoading) return <Loading />
  if (!user) return <NotFound text={t("game_main.server_connection_error")} code={t("game_main.error_code")} />

  if (matchState?.match_status != "close") {
	return (
    <div className="relative w-full min-h-[100svh] overflow-hidden bg-black">
      <div ref={containerRef} className="absolute inset-0 h-full w-full touch-none" />
      {isMobile && isLandscape && (
        <div className="select-none pointer-events-none absolute inset-20 z-20 flex items-end justify-between">
          <div className="pointer-events-none flex items-end gap-3">
            <div className="grid grid-cols-3 gap-3 pointer-events-auto">
              <span aria-hidden="true" />
              <button
                type="button"
                data-mobile-control="forward"
                className="h-14 w-14 rounded-full border border-white/25 bg-black/55 text-white text-lg font-bold shadow-lg backdrop-blur-sm active:scale-95 touch-none"
                aria-label="Move forward"
              >
                ▲
              </button>
              <span aria-hidden="true" />
              <button
                type="button"
                data-mobile-control="left"
                className="h-14 w-14 rounded-full border border-white/25 bg-black/55 text-white text-lg font-bold shadow-lg backdrop-blur-sm active:scale-95 touch-none"
                aria-label="Move left"
              >
                ◀
              </button>
              <button
                type="button"
                data-mobile-control="back"
                className="h-14 w-14 rounded-full border border-white/25 bg-black/55 text-white text-lg font-bold shadow-lg backdrop-blur-sm active:scale-95 touch-none"
                aria-label="Move back"
              >
                ▼
              </button>
              <button
                type="button"
                data-mobile-control="right"
                className="h-14 w-14 rounded-full border border-white/25 bg-black/55 text-white text-lg font-bold shadow-lg backdrop-blur-sm active:scale-95 touch-none"
                aria-label="Move right"
              >
                ▶
              </button>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4 pointer-events-auto">
            <button
              type="button"
              data-mobile-control="jump"
              className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-blue-500/80 text-sm font-extrabold text-white shadow-lg backdrop-blur-sm active:scale-95 touch-none"
              aria-label="Jump"
            >
              JUMP
            </button>
            <button
              type="button"
              data-mobile-control="shoot"
              className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-red-500/80 text-sm font-extrabold text-white shadow-lg backdrop-blur-sm active:scale-95 touch-none"
              aria-label="Shoot"
            >
              FIRE
            </button>
          </div>
        </div>
      )}
    {isMobile && !isLandscape && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 px-6 text-center">
          <div className="max-w-sm rounded-xl border border-white/20 bg-black/70 px-5 py-4 text-white backdrop-blur-sm">
            <p className="text-lg font-bold">{t("game_main.require_landscape")}</p>
            <p className="mt-2 text-sm text-white/80">{t("game_main.require_landscape_message")}</p>
          </div>
        </div>
    )}
    {!paused && isView && (
        <div className="select-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/60 px-4 py-3 text-center text-sm text-white sm:px-6 sm:py-4 sm:text-2xl max-w-[90vw]">
      {t("game_main.spectator_mode")}
    </div>
    )}
    {paused && (
        <div className="select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/60 px-4 py-3 text-center text-sm text-white sm:px-6 sm:py-4 sm:text-2xl max-w-[90vw]">
      {t("game_main.pause_click_resume")}
    </div>
    )}
    {!paused && !isView && (
        <div className="select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-4 py-3 text-white text-lg sm:px-6 sm:py-4 sm:text-2xl">
      +
    </div>
    )}
    {!paused && matchState?.current_player?.hit_other_player && (
        <div className="select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg px-4 py-3 text-white text-2xl sm:px-6 sm:py-4 sm:text-3xl">
      X
    </div>
    )}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-black/45 backdrop-blur-sm border-t border-white/10 px-2 py-2 sm:px-4 sm:py-3">
        <div className="select-none grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-5 lg:text-2xl">
          <div className={`font-display whitespace-nowrap ${matchState?.current_player.health < 30 ? "text-red-500/70" : "text-white/70"}`}>
        	{t("game_main.hud_health")}: {matchState?.current_player?.health.toFixed(0)}%
      	  </div>
          <div className={`font-display whitespace-nowrap ${matchState?.current_player.arms_left < 2 ? "text-red-500/70" : "text-white/70"}`}>
        	{t("game_main.hud_arms")}: {matchState.current_player.arms_left}
      	  </div>
          <div className="font-display whitespace-nowrap text-green-400/70">
        	{t("game_main.hud_score")}: {matchState?.current_player?.score}
      	  </div>
          <div className="font-display whitespace-nowrap text-yellow-300/80">
        	{t("game_main.hud_time")}: {matchState?.time_left}
      	  </div>
          <div className="font-display whitespace-nowrap text-blue-300/80 col-span-2 sm:col-span-1">
        	{t("game_main.hud_players")}: {matchState?.online_players}
          </div>
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
      className="w-full min-h-[100svh] overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-4 sm:py-8 lg:px-6 lg:py-10 flex flex-col items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="flex flex-col gap-5 w-full max-w-4xl border border-gray-600 rounded-2xl p-4 sm:p-6 md:p-10 shadow-2xl bg-gray-800/95 backdrop-blur-sm relative">
        <ButtonClose onClose={() => navigate('/')} className="absolute top-3 right-3 sm:top-4 sm:right-4" />

        <h2 className="font-extrabold text-2xl sm:text-3xl md:text-5xl text-white text-center tracking-wide mb-1 sm:mb-2 leading-tight">
          {won ? t("game_main.end_title_win") : t("game_main.end_title_loss")}
        </h2>

        <div className="flex flex-col gap-3 text-gray-200 text-sm sm:text-base md:text-lg bg-gray-700/90 p-4 sm:p-6 rounded-xl border border-gray-600 shadow-inner">
          <h3 className={`text-lg sm:text-xl md:text-2xl font-bold border-b border-gray-500 pb-2 ${won ? 'text-green-400' : 'text-red-400'}`}>
            {won ? t("game_main.end_result_win") : t("game_main.end_result_loss")}
          </h3>
          <p className="leading-relaxed text-gray-300">
            {t("game_main.end_final_score")}: <span className="font-bold text-white">{score}</span>
          </p>
          <p className="leading-relaxed text-gray-300">
            {t("game_main.end_remaining_players")}: <span className="font-bold text-white">{onlinePlayers}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
          <button
            type="button"
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition cursor-pointer"
            onClick={() => {
              resetMatchState()
              matchStateRef.current = defaultMatchState
              setMatchState(defaultMatchState)
              navigate('/')}}>
            {t("game_main.end_back_main_menu")}
          </button>

          {!won && onlinePlayers > 1 && (
            <button
              type="button"
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg transition cursor-pointer"
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