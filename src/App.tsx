import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AdSenseBanner } from './AdSenseBanner'
import { LanguageProvider, LanguageToggle, useI18n, teamName, positionName, handName, playerName, localizedPath, isDailyUpdateWindow, formatRosterDate, type Locale, type TranslationKey } from './i18n'
import { api, type Guess, type Mode, type PickedPlayer, type Player, type RosterPlayer, type Status } from './api'
import { resultShareText, shareUrlForTeam } from './share'

const MAX_TRIES = 9
const fields: Array<[keyof Guess['compare'], TranslationKey, keyof PickedPlayer]> = [
  ['team', '구단', 'team'], ['backNo', '등번호', 'backNo'], ['position', '포지션', 'position'], ['throwingHand', '투구', 'throwingHand'], ['battingSide', '타석', 'battingSide'], ['birthYear', '출생연도', 'birthYear'], ['height', '키', 'height'], ['weight', '몸무게', 'weight'],
]
const statusText: Record<Status, string> = { MATCH: '', MISMATCH: '', UP: '↑', DOWN: '↓' }
const resultEmoji: Record<Status, string> = { MATCH: '🟩', MISMATCH: '⬜️', UP: '🟨', DOWN: '🟨' }
const positionOrder = ['감독', '코치', '투수', '포수', '내야수', '외야수']
function displayField(player: PickedPlayer, key: keyof PickedPlayer, locale: Locale) {
  const value = player[key]
  if (value === null || value === undefined) return '—'
  if (key === 'team') return teamName(String(value), locale)
  if (key === 'position') return positionName(String(value), locale, true)
  if (key === 'throwingHand' || key === 'battingSide') return handName(String(value), locale)
  return String(value)
}

function StaffToggle({ includeStaff, onChange, modal = false }: { includeStaff: boolean; onChange: (value: boolean) => void; modal?: boolean }) {
  const { t } = useI18n()
  return <div className={modal ? 'modal-staff-toggle' : 'staff-toggle'}>{modal && <b className="modal-setting-title">{t('출제 대상')}</b>}<div className="staff-options"><button className={!includeStaff ? 'selected' : undefined} onClick={() => onChange(false)}>{t('선수만')}<span>{t('감독·코치 제외')}</span></button><button className={includeStaff ? 'selected' : undefined} onClick={() => onChange(true)}>{t('감독·코치 포함')}<span>{t('스태프까지 함께 출제')}</span></button></div></div>
}

function ShareMenu({ teams, isOpen, isCopied, onToggle, onShare }: { teams: string[]; isOpen: boolean; isCopied: boolean; onToggle: () => void; onShare: (team: string) => void }) {
  const { locale, t } = useI18n()
  return <div className="share-menu">
    <button className={`share-button${isCopied ? ' copied' : ''}`} onClick={onToggle} aria-label={t('구단별 게임 링크 공유하기')} aria-expanded={isOpen} title={isCopied ? t('복사됐습니다') : t('게임 링크 공유하기')}><span className="share-figure" aria-hidden="true"><i>?</i><span>{t('누크야')}</span><i>?</i></span><b>{isCopied ? t('복사됨') : t('공유')}</b></button>
    {isOpen && <div className="share-menu-list" role="menu" aria-label={t('공유할 구단 선택')}><p className="share-menu-title">{t('공유할 구단을 선택하세요')}</p>{teams.length > 0 ? teams.map(team => <button key={team} role="menuitem" onClick={() => onShare(team)}>{teamName(team, locale)}</button>) : <span>{t('구단 목록을 불러오는 중…')}</span>}</div>}
  </div>
}

function BrandMark({ onClick }: { onClick?: () => void }) {
  const { t } = useI18n()
  const content = <><span>{t('누크야')}</span><img src="/nukeya-mark.png" alt="" aria-hidden="true" /></>
  return onClick
    ? <button className="brand-mark" onClick={onClick} aria-label={t('누크야! 메인으로')}>{content}</button>
    : <div className="brand-mark" aria-label={t('누크야!')}>{content}</div>
}

function GameStatus({ meta, message, finished }: { meta: { rosterDate: string | null; playerCount: number; tries: number } | null; message: TranslationKey | null; finished: boolean }) {
  const { locale, t } = useI18n()
  return <div className="game-status">
    <div className="game-status-meta">
      {meta ? <>
        <span>{t('선수 명단 기준일')}</span>
        <details className="roster-date-help">
          <summary aria-label={t('선수 명단 기준 설명 보기')}>?</summary>
          <span className="roster-date-tooltip" role="note">{t('표시된 기준일의 1군 등록 명단을 기준으로 하며, 매일 전날 명단으로 갱신됩니다.')}</span>
        </details>
        <span>: {formatRosterDate(meta.rosterDate, locale)}</span>
        <span> · {t('선수 수')}: {meta.playerCount}{locale === 'ko' ? '명' : ''} · {t('시도')}: {meta.tries}/{MAX_TRIES}</span>
      </> : <span>{t('로딩 중…')}</span>}
    </div>
    {message && !finished && <div className="notice">{t(message)}</div>}
  </div>
}

function RulesButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n()
  return <button className="rules-button" onClick={onClick} aria-label={t('게임 규칙 보기')} aria-haspopup="dialog" title={t('게임 규칙 보기')}><span aria-hidden="true">?</span></button>
}

function RulesModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  return <div className="game-modal-backdrop rules-modal-backdrop" onMouseDown={onClose}>
    <section className="game-modal rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title" onMouseDown={event => event.stopPropagation()}>
      <div className="modal-header"><div><p className="eyebrow">HOW TO PLAY</p><h2 id="rules-title">{t('어떻게 맞히나요?')}</h2></div><button onClick={onClose} aria-label={t('닫기')}>×</button></div>
      <p className="rules-intro">{t('선수 정보를 비교하며 숨겨진 한국 프로야구 선수를 최대 9번 안에 맞혀보세요.')}</p>
      <ol className="rules-steps">
        <li><span>1</span><div><strong>{t('게임 범위를 정해요')}</strong><p>{t('출제 구단과 1군·퓨처스, 감독·코치 포함 여부를 선택하면 정답 선수가 정해집니다.')}</p></div></li>
        <li><span>2</span><div><strong>{t('선수를 추측해요')}</strong><p>{t('선수명을 두 글자 이상 입력하고 검색 결과에서 선수를 선택하세요. 명단에서 출제 가능한 선수도 확인할 수 있어요.')}</p></div></li>
        <li><span>3</span><div><strong>{t('단서를 비교해요')}</strong><p>{t('구단, 등번호, 포지션, 투구·타석, 출생연도, 키와 몸무게를 보고 다음 선수를 추리하세요.')}</p></div></li>
      </ol>
      <div className="rules-feedback" aria-label={t('결과 표시 설명')}>
        <div><span className="rules-color match">{t('일치')}</span><p><strong>{t('정답과 같아요')}</strong>{t('초록색으로 표시됩니다.')}</p></div>
        <div><span className="rules-color mismatch">{t('다름')}</span><p><strong>{t('정답과 달라요')}</strong>{t('회색으로 표시됩니다.')}</p></div>
        <div><span className="rules-color up">↑</span><p><strong>{t('정답 값이 더 커요')}</strong>{t('더 높은 숫자를 찾아보세요.')}</p></div>
        <div><span className="rules-color down">↓</span><p><strong>{t('정답 값이 더 작아요')}</strong>{t('더 낮은 숫자를 찾아보세요.')}</p></div>
      </div>
      <p className="rules-note">{t('↑·↓ 표시는 등번호, 출생연도, 키, 몸무게에서 다음 추측의 방향을 알려줍니다.')}</p>
    </section>
  </div>
}

function PlayerRoster({ players }: { players: RosterPlayer[] }) {
  const { locale, t } = useI18n()
  const playersByTeam = new Map<string, RosterPlayer[]>()
  players.forEach(player => {
    const team = player.team.trim()
    playersByTeam.set(team, [...(playersByTeam.get(team) ?? []), player])
  })
  const teams = [...playersByTeam.keys()]
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const rosterContentRef = useRef<HTMLElement>(null)
  const activeTeam = selectedTeam && teams.includes(selectedTeam) ? selectedTeam : teams[0]
  const teamPlayers = activeTeam ? playersByTeam.get(activeTeam) ?? [] : []

  useEffect(() => {
    rosterContentRef.current?.scrollTo({ top: 0 })
  }, [activeTeam])

  if (!activeTeam) return null

  return <div className="player-roster">
    <div className="roster-team-selector" role="tablist" aria-label={t('구단 선택')}>
      {teams.map(team => <button className={team === activeTeam ? 'selected' : undefined} key={team} role="tab" aria-selected={team === activeTeam} onClick={() => setSelectedTeam(team)}>{teamName(team, locale)}</button>)}
    </div>
    <section className="roster-team" ref={rosterContentRef}><div className="roster-level">{[...positionOrder, ...[...new Set(teamPlayers.map(player => player.position))].filter(position => !positionOrder.includes(position)).sort((a, b) => a.localeCompare(b, 'ko'))].map(position => {
      const positionPlayers = teamPlayers.filter(player => player.position === position).sort((a, b) => {
        if (a.rosterLevel !== b.rosterLevel) return a.rosterLevel === 'REGULAR' ? -1 : 1
        return playerName(a, locale).localeCompare(playerName(b, locale), locale)
      })
      return positionPlayers.length > 0 && <div className="roster-position" key={position}><b>{positionName(position, locale)}</b><div>{positionPlayers.map((player, index) => <span className={`roster-player ${player.rosterLevel.toLowerCase()}`} key={`${player.name}-${player.position}-${player.rosterLevel}-${index}`}>{playerName(player, locale)}</span>)}</div></div>
    })}</div></section>
  </div>
}

function gameIdFromPath() {
  const match = window.location.pathname.match(/^\/game\/([\w-]+)$/)
  return match?.[1] ?? null
}

export default function App() {
  return <LanguageProvider><GameApp /></LanguageProvider>
}

function GameApp() {
  const { locale, t } = useI18n()
  const localeRef = useRef(locale)
  useLayoutEffect(() => { localeRef.current = locale }, [locale])
  const [gameId, setGameId] = useState(gameIdFromPath)
  const [mode, setMode] = useState<Mode | null>(null)
  const [setupMode, setSetupMode] = useState<Mode>('REGULAR')
  const [includeStaff, setIncludeStaff] = useState(false)
  const [gameIncludesStaff, setGameIncludesStaff] = useState(false)
  const [teamOptions, setTeamOptions] = useState<string[]>([])
  const [shareTeams, setShareTeams] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [gameTeams, setGameTeams] = useState<string[]>([])
  const [isTeamPickerOpen, setIsTeamPickerOpen] = useState(false)
  const [isRosterOpen, setIsRosterOpen] = useState(false)
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [rosterPlayers, setRosterPlayers] = useState<RosterPlayer[]>([])
  const [isRosterLoading, setIsRosterLoading] = useState(false)
  const [rosterError, setRosterError] = useState<TranslationKey | null>(null)
  const [isUpdateWindow, setIsUpdateWindow] = useState(isDailyUpdateWindow)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isShareCopied, setIsShareCopied] = useState(false)
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false)
  const [isResultCopied, setIsResultCopied] = useState(false)
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'empty' | 'error' | 'ready'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [answer, setAnswer] = useState<PickedPlayer | null>(null)
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false)
  const [meta, setMeta] = useState<{ rosterDate: string | null; playerCount: number; tries: number } | null>(null)
  const [message, setMessage] = useState<TranslationKey | null>(null)
  const activePlayerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const boardRowsRef = useRef<HTMLDivElement>(null)
  const submittingRef = useRef(false)
  const gameVersionRef = useRef(0)
  const wasUpdateWindowRef = useRef(isDailyUpdateWindow())
  const finished = Boolean(answer)
  const resultGrid = useMemo(() => guesses.map(guess => fields.map(([key]) => resultEmoji[guess.compare[key].status]).join('')).join('\n'), [guesses])
  const visibleRosterPlayers = useMemo(() => rosterPlayers.filter(player =>
    gameTeams.includes(player.team)
    && (mode === 'ALL' || player.rosterLevel === 'REGULAR')
    && (gameIncludesStaff || (player.position !== '감독' && player.position !== '코치'))
  ), [gameIncludesStaff, gameTeams, mode, rosterPlayers])

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.append(textArea)
      textArea.select()
      document.execCommand('copy')
      textArea.remove()
    }
  }

  async function copyShareLink(team: string) {
    await copyToClipboard(shareUrlForTeam(team, locale))
    setIsShareMenuOpen(false)
    setIsShareCopied(true)
    window.setTimeout(() => setIsShareCopied(false), 1800)
  }

  async function copyResult() {
    if (!resultGrid || !answer) return
    await copyToClipboard(resultShareText(resultGrid, answer, locale))
    setIsResultCopied(true)
    window.setTimeout(() => setIsResultCopied(false), 1800)
  }

  useEffect(() => {
    document.body.classList.toggle('light-theme', !isDarkMode)
    document.documentElement.classList.toggle('light-theme', !isDarkMode)
    return () => {
      document.body.classList.remove('light-theme')
      document.documentElement.classList.remove('light-theme')
    }
  }, [isDarkMode])

  const canSearch = useMemo(() => query.trim().length >= 2 && mode && !finished && !isSubmitting, [query, mode, finished, isSubmitting])

  function setMetaFromState(state: { rosterDate: string | null; playerCount: number }, tries = guesses.length) {
    setMeta({ ...state, tries })
  }
  async function updateMeta(tries = guesses.length, gameVersion = gameVersionRef.current) {
    if (!gameId) return
    const state = await api.state(gameId)
    if (gameVersion === gameVersionRef.current) setMetaFromState(state, tries)
  }
  async function showAnswer(gameVersion = gameVersionRef.current) {
    if (!gameId) return
    const result = await api.answer(gameId)
    if (gameVersion === gameVersionRef.current) { setAnswer(result); setIsAnswerModalOpen(true) }
  }
  async function start(nextMode: Mode) {
    if (selectedTeams.length === 0) { setMessage('한 개 이상의 구단을 선택해주세요.'); return }
    if (isStartingGame) return
    const gameVersion = ++gameVersionRef.current
    setIsStartingGame(true)
    try {
      const game = await api.create(nextMode, includeStaff, selectedTeams)
      if (gameVersion !== gameVersionRef.current) return
      setGameId(game.gameId)
      window.history.replaceState(null, '', localizedPath(`/game/${game.gameId}`, localeRef.current))
      setMode(game.mode)
      setSetupMode(game.mode)
      setIncludeStaff(game.includeStaff)
      setGameIncludesStaff(game.includeStaff)
      setGameTeams(game.teams)
      setIsTeamPickerOpen(false)
      setGuesses([]); setAnswer(null); setIsAnswerModalOpen(false); setQuery(''); setPlayers([]); setActivePlayerIndex(-1); setMessage(null); setIsResultCopied(false)
      setMetaFromState(game, 0)
    } catch { if (gameVersion === gameVersionRef.current) setMessage('새 게임을 시작하지 못했습니다. 백엔드 연결을 확인해주세요.') }
    finally { setIsStartingGame(false) }
  }
  function returnToSetup() {
    gameVersionRef.current += 1
    setGameId(null)
    setMode(null)
    setGameIncludesStaff(false)
    setGameTeams([])
    setGuesses([])
    setAnswer(null)
    setIsAnswerModalOpen(false)
    setQuery('')
    setPlayers([])
    setActivePlayerIndex(-1)
    setMessage(null)
    setMeta(null)
    window.history.replaceState(null, '', localizedPath('/', locale))
  }
  async function selectPlayer(player: Player) {
    if (!gameId || !mode || gameTeams.length === 0 || finished || guesses.length >= MAX_TRIES || submittingRef.current) return
    const gameVersion = gameVersionRef.current
    // Close the virtual keyboard on mobile, but preserve desktop IME composition.
    if (window.matchMedia('(max-width: 600px)').matches) searchInputRef.current?.blur()
    else searchInputRef.current?.focus()
    submittingRef.current = true
    setIsSubmitting(true)
    setPlayers([])
    setActivePlayerIndex(-1)
    try {
      const result = await api.guess(gameId, player.id)
      if (gameVersion !== gameVersionRef.current) return
      const nextCount = guesses.length + 1
      setGuesses(previous => [...previous, result]); setQuery(''); setPlayers([]); setActivePlayerIndex(-1)
      await updateMeta(nextCount, gameVersion)
      if (gameVersion !== gameVersionRef.current) return
      if (result.isCorrect) { await showAnswer(gameVersion); if (gameVersion === gameVersionRef.current) setMessage('정답입니다!') }
      else if (nextCount >= MAX_TRIES) { await showAnswer(gameVersion); if (gameVersion === gameVersionRef.current) setMessage('아쉽지만, 이번 문제는 여기까지예요.') }
    } catch { setMessage('추리 요청에 실패했습니다. 잠시 후 다시 시도해주세요.') }
    finally {
      submittingRef.current = false
      setIsSubmitting(false)
      if (!window.matchMedia('(max-width: 600px)').matches) {
        window.requestAnimationFrame(() => searchInputRef.current?.focus())
      }
    }
  }
  async function openRoster() {
    if (!mode) return
    setIsRosterOpen(true)
    if (rosterPlayers.length > 0) return
    setIsRosterLoading(true)
    setRosterError(null)
    try {
      setRosterPlayers(await api.players('ALL', true))
    } catch {
      setRosterError('선수 명단을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsRosterLoading(false)
    }
  }

  useEffect(() => {
    const updateAvailability = () => {
      const shouldBlock = isDailyUpdateWindow()
      if (!shouldBlock && wasUpdateWindowRef.current) window.location.reload()
      wasUpdateWindowRef.current = shouldBlock
      setIsUpdateWindow(shouldBlock)
    }
    updateAvailability()
    const timer = window.setInterval(updateAvailability, 10_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!gameId) { setMeta(null); return }
    const gameVersion = gameVersionRef.current
    api.state(gameId).then(state => {
      if (gameVersion !== gameVersionRef.current) return
      setMode(state.mode)
      setSetupMode(state.mode)
      setIncludeStaff(state.includeStaff)
      setGameIncludesStaff(state.includeStaff)
      setSelectedTeams(state.teams)
      setGameTeams(state.teams)
      setMetaFromState(state)
    }).catch(() => {
      if (gameVersion !== gameVersionRef.current) return
      window.history.replaceState(null, '', localizedPath('/', localeRef.current))
      setGameId(null)
      setMode(null)
    })
  }, [gameId])

  useEffect(() => {
    if (!gameId && /^\/game\/?$/.test(window.location.pathname)) {
      window.history.replaceState(null, '', localizedPath('/', locale))
    }
  }, [gameId])

  useEffect(() => {
    api.teams(setupMode).then(teams => {
      setTeamOptions(teams)
      setSelectedTeams(previous => previous.filter(team => teams.includes(team)))
    }).catch(() => setMessage('구단 목록을 불러오지 못했습니다.'))
  }, [setupMode])

  useEffect(() => {
    api.teams('REGULAR').then(setShareTeams).catch(() => setShareTeams([]))
  }, [])

  useEffect(() => {
    if (!canSearch || !mode || !isSearchFocused) {
      setPlayers([]); setActivePlayerIndex(-1); setSearchStatus('idle')
      return
    }
    let active = true
    setPlayers([])
    setActivePlayerIndex(-1)
    setSearchStatus('loading')
    const timer = window.setTimeout(() => api.search(query.trim(), mode, gameIncludesStaff, gameTeams).then(results => {
      if (!active) return
      setPlayers(results)
      setActivePlayerIndex(results.length > 0 ? 0 : -1)
      setSearchStatus(results.length > 0 ? 'ready' : 'empty')
    }).catch(() => {
      if (!active) return
      setPlayers([]); setActivePlayerIndex(-1); setSearchStatus('error')
    }), 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [query, mode, gameIncludesStaff, gameTeams, canSearch, isSearchFocused])

  useLayoutEffect(() => {
    if (guesses.length === 0) return
    const rows = boardRowsRef.current
    if (!rows) return

    rows.scrollTop = rows.scrollHeight
  }, [guesses.length])

  useEffect(() => {
    activePlayerRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activePlayerIndex])

  useEffect(() => {
    const focusSearchOnTyping = (event: KeyboardEvent) => {
      if (finished || !mode || event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key.length !== 1 && event.key !== 'Process') return
      const target = event.target as HTMLElement | null
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable) return
      searchInputRef.current?.focus()
    }
    window.addEventListener('keydown', focusSearchOnTyping)
    return () => window.removeEventListener('keydown', focusSearchOnTyping)
  }, [finished, mode])

  useEffect(() => {
    if (!isRulesOpen) return
    const closeRulesOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsRulesOpen(false)
    }
    window.addEventListener('keydown', closeRulesOnEscape)
    return () => window.removeEventListener('keydown', closeRulesOnEscape)
  }, [isRulesOpen])

  if (isUpdateWindow) return <main className="daily-update"><LanguageToggle /><section><p className="eyebrow">DAILY ROSTER UPDATE</p><h1>{t('선수단 정보를 업데이트하고 있습니다.')}</h1><p>{t('매일 새벽 4:00~4:05에는 최신 선수 정보 반영을 위해 잠시 이용할 수 없습니다.')}</p></section></main>

  if (!mode) return <main className="landing"><LanguageToggle /><ShareMenu teams={shareTeams} isOpen={isShareMenuOpen} isCopied={isShareCopied} onToggle={() => setIsShareMenuOpen(value => !value)} onShare={copyShareLink} /><RulesButton onClick={() => setIsRulesOpen(true)} /><button aria-label={t(isDarkMode ? '라이트 모드' : '다크 모드')} title={t(isDarkMode ? '라이트 모드' : '다크 모드')} className="theme-toggle" onClick={() => setIsDarkMode(value => !value)}>{isDarkMode ? t('라이트 모드') : t('다크 모드')}</button><section><BrandMark /><h1>{t('한국 프로야구')}<br />{t('선수를 맞혀보세요.')}</h1><p>{t('구단을 선택하면 해당 구단 선수 중 한 명이 정답으로 출제됩니다.')}</p><AdSenseBanner className="landing-ad" teams={selectedTeams} /><div className="mode-grid"><button className={setupMode === 'REGULAR' ? 'selected' : undefined} onClick={() => setSetupMode('REGULAR')}>{t('1군')}<span>{t('현역 1군 선수')}</span></button><button className={setupMode === 'ALL' ? 'selected' : undefined} onClick={() => setSetupMode('ALL')}>{t('1군 + 퓨처스')}<span>{t('더 넓은 로스터')}</span></button></div><StaffToggle includeStaff={includeStaff} onChange={setIncludeStaff} /><div className="team-picker"><div><b>{t('출제 구단')}</b><button onClick={() => setSelectedTeams(selectedTeams.length === teamOptions.length ? [] : teamOptions)}>{selectedTeams.length === teamOptions.length ? t('전체 해제') : t('전체 선택')}</button></div><div className="team-list">{teamOptions.map(team => <button className={selectedTeams.includes(team) ? 'selected' : undefined} key={team} onClick={() => setSelectedTeams(previous => previous.includes(team) ? previous.filter(value => value !== team) : [...previous, team])}>{teamName(team, locale)}</button>)}</div></div><button className="start-game" disabled={selectedTeams.length === 0 || isStartingGame} onClick={() => start(setupMode)}>{isStartingGame ? t('게임 시작 중…') : t('선택한 구단으로 시작하기')}</button>{message && <div className="notice">{t(message)}</div>}</section>{isRulesOpen && <RulesModal onClose={() => setIsRulesOpen(false)} />}</main>

  return (
    <main className="app">
      <header>
        <BrandMark onClick={returnToSetup} />
        <div className="header-actions"><LanguageToggle /><ShareMenu teams={shareTeams} isOpen={isShareMenuOpen} isCopied={isShareCopied} onToggle={() => setIsShareMenuOpen(value => !value)} onShare={copyShareLink} /><RulesButton onClick={() => setIsRulesOpen(true)} /><button aria-label={t(isDarkMode ? '라이트 모드' : '다크 모드')} title={t(isDarkMode ? '라이트 모드' : '다크 모드')} className="theme-toggle" onClick={() => setIsDarkMode(value => !value)}>{isDarkMode ? t('라이트 모드') : t('다크 모드')}</button></div>
      </header>
      <section className="hero"><p className="eyebrow">{mode === 'REGULAR' ? 'REGULAR ROSTER' : 'ALL ROSTER'}</p><div className="hero-title-row"><h1>{t('선수 맞추기')}</h1><button className="game-action action-new" disabled={isStartingGame} onClick={() => start(mode)} aria-label={t('새 게임 시작')} title={t('새 게임 시작')}><span aria-hidden="true">↻</span></button><button className="game-action action-roster" onClick={openRoster}>{t('명단')}</button><button className="game-action action-teams" onClick={() => setIsTeamPickerOpen(true)}>{t('구단 선택')}</button></div><GameStatus meta={meta} message={message} finished={finished} /></section>
      <section className="board">
        <div className="grid header"><span>{t('선수')}</span>{fields.map(([, label]) => <span key={label}>{t(label)}</span>)}</div>
        <div className="board-rows" ref={boardRowsRef}>{guesses.map((guess, index) => <div className="grid row" key={`${guess.picked.id}-${index}`}><strong>{playerName(guess.picked, locale)}<small>{teamName(guess.picked.team, locale)}</small></strong>{fields.map(([key, , valueKey]) => <div className={`cell ${guess.compare[key].status.toLowerCase()}`} key={key}>{displayField(guess.picked, valueKey, locale)}<em>{statusText[guess.compare[key].status]}</em></div>)}</div>)}</div>
      </section>
      <section className="current-teams"><b>{t('현재 출제 구단')}</b><div>{gameTeams.map(team => <span key={team}>{teamName(team, locale)}</span>)}</div></section>
      <section className="search">
        <div className="search-row">
          <div className="search-input" onBlur={event => {
            const container = event.currentTarget
            window.setTimeout(() => {
              if (!container.contains(document.activeElement)) { setPlayers([]); setActivePlayerIndex(-1); setIsSearchFocused(false) }
            }, 0)
          }}>
            <input ref={searchInputRef} autoFocus={!window.matchMedia('(max-width: 600px)').matches} disabled={finished} readOnly={isSubmitting} value={query} onChange={event => { setQuery(event.target.value); setActivePlayerIndex(-1) }} onFocus={() => setIsSearchFocused(true)} onKeyDown={event => {
              if (event.key === 'Escape') { event.preventDefault(); setPlayers([]); setActivePlayerIndex(-1); event.currentTarget.blur(); return }
              if (players.length === 0) return
              if (event.key === 'ArrowDown') { event.preventDefault(); setActivePlayerIndex(index => index >= players.length - 1 ? 0 : index + 1) }
              else if (event.key === 'ArrowUp') { event.preventDefault(); setActivePlayerIndex(index => index <= 0 ? players.length - 1 : index - 1) }
              else if (event.key === 'Enter' && activePlayerIndex >= 0) { event.preventDefault(); selectPlayer(players[activePlayerIndex]) }
            }} aria-label={t('선수명 2글자 이상 입력')} placeholder={t('선수명 2글자 이상 입력')} />
            {canSearch && isSearchFocused && searchStatus !== 'ready' && searchStatus !== 'idle' && <div className="suggestions search-feedback" role="status">{t(searchStatus === 'loading' ? '선수 검색 중…' : searchStatus === 'empty' ? '선수를 찾지 못했습니다. 다른 이름으로 검색해주세요.' : '선수를 검색하지 못했습니다. 잠시 후 다시 시도해주세요.')}</div>}
            {players.length > 0 && <div className="suggestions" aria-label={t('선수 검색 결과')}>{players.map((player, index) => <button disabled={isSubmitting} className={index === activePlayerIndex ? 'active' : undefined} ref={index === activePlayerIndex ? activePlayerRef : undefined} key={player.id} onClick={() => selectPlayer(player)}><b>{playerName(player, locale)}</b><span>{teamName(player.team, locale)} · {positionName(player.position, locale)} · {locale === 'ko' ? `${player.birthYear}년생` : `Born ${player.birthYear}`}</span></button>)}</div>}
          </div>
        </div>
      </section>
      <AdSenseBanner teams={gameTeams} />
      {isRulesOpen && <RulesModal onClose={() => setIsRulesOpen(false)} />}
      {answer && isAnswerModalOpen && <div className="game-modal-backdrop" onMouseDown={() => setIsAnswerModalOpen(false)}><section className="game-modal answer-modal" role="dialog" aria-modal="true" aria-label={t('게임 결과')} onMouseDown={event => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">{guesses.some(guess => guess.isCorrect) ? 'CORRECT' : 'GAME OVER'}</p><h2>{guesses.some(guess => guess.isCorrect) ? t('정답입니다!') : t('아쉽지만, 이번 문제는 여기까지예요.')}</h2></div><button onClick={() => setIsAnswerModalOpen(false)} aria-label={t('닫기')}>×</button></div><div className="answer"><p>{t('정답 선수')}</p><h2>{playerName(answer, locale)}</h2><span>{teamName(answer.team, locale)} · {locale === 'ko' ? `${answer.backNo}번` : `#${answer.backNo}`} · {positionName(answer.position, locale)}</span><span>{answer.height == null ? '—' : `${answer.height} cm`} / {answer.weight == null ? '—' : `${answer.weight} kg`}</span><button className="result-copy" onClick={copyResult}>{isResultCopied ? t('결과 복사됨') : t('결과 복사하기')}</button></div><div className="result-actions"><button className="result-new-game" disabled={isStartingGame} onClick={() => start(mode)}>{isStartingGame ? t('시작 중…') : t('새 게임')}</button><button className="result-team-select" onClick={() => { setIsAnswerModalOpen(false); setIsTeamPickerOpen(true) }}>{t('구단 선택')}</button></div></section></div>}
      {isRosterOpen && <div className="game-modal-backdrop" onMouseDown={() => setIsRosterOpen(false)}><section className="game-modal roster-modal" role="dialog" aria-modal="true" aria-label={t('전체 선수 명단')} onMouseDown={event => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">PLAYER ROSTER</p><h2>{t('전체 선수 명단')}</h2></div><button onClick={() => setIsRosterOpen(false)} aria-label={t('닫기')}>×</button></div><div className="roster-guide"><span>{t('현재 게임에서 선택한 구단의 선수 명단입니다.')}</span><span>{t('구단을 고르면 포지션별로 확인할 수 있어요.')}</span><span className="roster-legend"><i className="regular" /> {t('1군 선수')} <i className="futures" />{t('퓨처스 선수')}</span></div>{isRosterLoading ? <div className="roster-state">{t('선수 명단을 불러오는 중…')}</div> : rosterError ? <div className="notice">{t(rosterError)}</div> : <PlayerRoster players={visibleRosterPlayers} />}</section></div>}
      {isTeamPickerOpen && <div className="game-modal-backdrop" onMouseDown={() => setIsTeamPickerOpen(false)}><section className="game-modal" role="dialog" aria-modal="true" aria-label={t('다음 게임 설정')} onMouseDown={event => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">NEXT GAME</p><h2>{t('다음 게임 출제 구단')}</h2></div><button onClick={() => setIsTeamPickerOpen(false)} aria-label={t('닫기')}>×</button></div><p>{t('게임을 시작하면 아래 설정으로 새로운 정답 선수가 출제됩니다.')}</p><div className="modal-mode-grid"><button className={setupMode === 'REGULAR' ? 'selected' : undefined} onClick={() => setSetupMode('REGULAR')}>{t('1군')}<span>{t('현역 1군 선수')}</span></button><button className={setupMode === 'ALL' ? 'selected' : undefined} onClick={() => setSetupMode('ALL')}>{t('1군 + 퓨처스')}<span>{t('더 넓은 로스터')}</span></button></div><StaffToggle includeStaff={includeStaff} onChange={setIncludeStaff} modal /><div className="modal-team-picker"><b>{t('출제 구단')}</b><button onClick={() => setSelectedTeams(selectedTeams.length === teamOptions.length ? [] : teamOptions)}>{selectedTeams.length === teamOptions.length ? t('전체 해제') : t('전체 선택')}</button><div className="team-list">{teamOptions.map(team => <button className={selectedTeams.includes(team) ? 'selected' : undefined} key={team} onClick={() => setSelectedTeams(previous => previous.includes(team) ? previous.filter(value => value !== team) : [...previous, team])}>{teamName(team, locale)}</button>)}</div></div><button className="modal-start-game" disabled={selectedTeams.length === 0 || isStartingGame} onClick={() => start(setupMode)}>{isStartingGame ? t('게임 시작 중…') : t('새 게임 시작')}</button></section></div>}
    </main>
  )
}
