import { useEffect, useMemo, useRef, useState } from 'react'
import { api, type Guess, type Mode, type PickedPlayer, type Player, type Status } from './api'

const MAX_TRIES = 8
const GAME_URL = 'https://guess-player-eosin.vercel.app/'
const fields: Array<[keyof Guess['compare'], string, keyof PickedPlayer]> = [
  ['team', '구단', 'team'], ['backNo', '등번호', 'backNo'], ['position', '포지션', 'position'], ['throwingHand', '투구', 'throwingHand'], ['battingSide', '타석', 'battingSide'], ['birthYear', '출생연도', 'birthYear'], ['height', '키', 'height'], ['weight', '몸무게', 'weight'],
]
const statusText: Record<Status, string> = { MATCH: '', MISMATCH: '', UP: '↑', DOWN: '↓' }
const resultEmoji: Record<Status, string> = { MATCH: '🟩', MISMATCH: '⬜️', UP: '🟨', DOWN: '🟨' }

function StaffToggle({ includeStaff, onChange, modal = false }: { includeStaff: boolean; onChange: (value: boolean) => void; modal?: boolean }) {
  return <div className={modal ? 'modal-staff-toggle' : 'staff-toggle'}>{modal && <b className="modal-setting-title">출제 대상</b>}<div className="staff-options"><button className={!includeStaff ? 'selected' : undefined} onClick={() => onChange(false)}>선수만<span>감독·코치 제외</span></button><button className={includeStaff ? 'selected' : undefined} onClick={() => onChange(true)}>감독·코치 포함<span>스태프까지 함께 출제</span></button></div></div>
}

function gameIdFromPath() {
  const match = window.location.pathname.match(/^\/game\/([\w-]+)$/)
  return match?.[1] ?? null
}

export default function App() {
  const [gameId, setGameId] = useState(gameIdFromPath)
  const [mode, setMode] = useState<Mode | null>(null)
  const [setupMode, setSetupMode] = useState<Mode>('REGULAR')
  const [includeStaff, setIncludeStaff] = useState(false)
  const [gameIncludesStaff, setGameIncludesStaff] = useState(false)
  const [teamOptions, setTeamOptions] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [gameTeams, setGameTeams] = useState<string[]>([])
  const [isTeamPickerOpen, setIsTeamPickerOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isShareCopied, setIsShareCopied] = useState(false)
  const [isResultCopied, setIsResultCopied] = useState(false)
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [answer, setAnswer] = useState<PickedPlayer | null>(null)
  const [meta, setMeta] = useState('로딩 중…')
  const [message, setMessage] = useState<string | null>(null)
  const activePlayerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const gameVersionRef = useRef(0)
  const finished = Boolean(answer)
  const resultGrid = useMemo(() => guesses.map(guess => fields.map(([key]) => resultEmoji[guess.compare[key].status]).join('')).join('\n'), [guesses])

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

  async function copyShareLink() {
    await copyToClipboard(GAME_URL)
    setIsShareCopied(true)
    window.setTimeout(() => setIsShareCopied(false), 1800)
  }

  async function copyResult() {
    if (!resultGrid) return
    await copyToClipboard(`${resultGrid}\n\n너도 맞춰볼래?\n${GAME_URL}`)
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

  const canSearch = useMemo(() => query.trim().length >= 2 && mode && !finished, [query, mode, finished])

  function setMetaFromState(state: { rosterDate: string | null; playerCount: number }, tries = guesses.length) {
    const date = state.rosterDate?.replaceAll('-', '.') ?? '동기화 전'
    setMeta(`선수 명단 기준일: ${date} · 선수 수: ${state.playerCount}명 · 시도: ${tries}/${MAX_TRIES}`)
  }
  async function updateMeta(tries = guesses.length, gameVersion = gameVersionRef.current) {
    if (!gameId) return
    const state = await api.state(gameId)
    if (gameVersion === gameVersionRef.current) setMetaFromState(state, tries)
  }
  async function showAnswer(gameVersion = gameVersionRef.current) {
    if (!gameId) return
    const result = await api.answer(gameId)
    if (gameVersion === gameVersionRef.current) setAnswer(result)
  }
  async function reset(nextMode: Mode) {
    if (!gameId) return
    try {
      await api.reset(gameId, nextMode, includeStaff)
      setGuesses([]); setAnswer(null); setQuery(''); setPlayers([]); setActivePlayerIndex(-1); setMessage(null); setIsResultCopied(false)
      await updateMeta(0)
    } catch { setMessage('게임을 초기화하지 못했습니다. 백엔드 연결을 확인해주세요.') }
  }
  async function start(nextMode: Mode) {
    if (selectedTeams.length === 0) { setMessage('한 개 이상의 구단을 선택해주세요.'); return }
    if (isStartingGame) return
    const gameVersion = ++gameVersionRef.current
    try {
      const game = await api.create(nextMode, includeStaff, selectedTeams)
      if (gameVersion !== gameVersionRef.current) return
      setGameId(game.gameId)
      window.history.replaceState(null, '', `/game/${game.gameId}`)
      setMode(game.mode)
      setSetupMode(game.mode)
      setIncludeStaff(game.includeStaff)
      setGameIncludesStaff(game.includeStaff)
      setGameTeams(game.teams)
      setIsTeamPickerOpen(false)
      setGuesses([]); setAnswer(null); setQuery(''); setPlayers([]); setActivePlayerIndex(-1); setMessage(null); setIsResultCopied(false)
      setMetaFromState(game, 0)
    } catch { setMessage('새 게임을 시작하지 못했습니다. 백엔드 연결을 확인해주세요.') }
  }
  function returnToSetup() {
    gameVersionRef.current += 1
    setGameId(null)
    setMode(null)
    setGameIncludesStaff(false)
    setGameTeams([])
    setGuesses([])
    setAnswer(null)
    setQuery('')
    setPlayers([])
    setActivePlayerIndex(-1)
    setMessage(null)
    setMeta('게임을 선택해주세요.')
    window.history.replaceState(null, '', '/')
  }
  async function selectPlayer(player: Player) {
    if (!gameId || !mode || gameTeams.length === 0 || finished || guesses.length >= MAX_TRIES || submittingRef.current) return
    const gameVersion = gameVersionRef.current
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
      if (result.isCorrect) { await showAnswer(gameVersion); if (gameVersion === gameVersionRef.current) setMessage(`정답입니다! ${result.picked.name} 선수를 맞혔어요.`) }
      else if (nextCount >= MAX_TRIES) { await showAnswer(gameVersion); if (gameVersion === gameVersionRef.current) setMessage('시도 횟수를 모두 사용했습니다.') }
    } catch { setMessage('추리 요청에 실패했습니다. 잠시 후 다시 시도해주세요.') }
    finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!gameId) { setMeta('게임을 선택해주세요.'); return }
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
      setMessage('게임을 찾을 수 없습니다. 새 게임을 시작해주세요.')
      setMeta('게임을 찾을 수 없습니다.')
    })
  }, [gameId])

  useEffect(() => {
    api.teams(setupMode).then(teams => {
      setTeamOptions(teams)
      setSelectedTeams(previous => previous.filter(team => teams.includes(team)))
    }).catch(() => setMessage('구단 목록을 불러오지 못했습니다.'))
  }, [setupMode])

  useEffect(() => {
    if (!canSearch || !mode) { setPlayers([]); setActivePlayerIndex(-1); return }
    const timer = window.setTimeout(() => api.search(query.trim(), mode, gameIncludesStaff, gameTeams).then(results => {
      setPlayers(results)
      setActivePlayerIndex(results.length > 0 ? 0 : -1)
    }).catch(() => { setPlayers([]); setActivePlayerIndex(-1) }), 250)
    return () => window.clearTimeout(timer)
  }, [query, mode, gameIncludesStaff, gameTeams, canSearch])

  useEffect(() => {
    if (guesses.length === 0) return
    let secondFrame: number | undefined
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
      })
    })
    return () => {
      window.cancelAnimationFrame(firstFrame)
      if (secondFrame) window.cancelAnimationFrame(secondFrame)
    }
  }, [guesses.length, answer, message])

  useEffect(() => {
    activePlayerRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activePlayerIndex])

  useEffect(() => {
    if (mode && !finished && !isSubmitting && window.matchMedia('(max-width: 600px)').matches) {
      searchInputRef.current?.focus()
    }
  }, [gameId, mode, finished, isSubmitting])

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

  if (!mode) return <main className="landing"><button className="share-button" onClick={copyShareLink} aria-label="게임 링크 공유하기" title={isShareCopied ? '복사됐습니다' : '게임 링크 공유하기'}><span className="share-figure" aria-hidden="true"><i>?</i><span>KBO</span><i>?</i></span><b>{isShareCopied ? '복사됨' : '공유'}</b></button><button className="theme-toggle" onClick={() => setIsDarkMode(value => !value)}>{isDarkMode ? '라이트 모드' : '다크 모드'}</button><section><p className="eyebrow">KBO PLAYER GUESS</p><h1>KBO 선수를<br />맞혀보세요.</h1><p>구단을 선택하면 해당 구단 선수 중 한 명이 정답으로 출제됩니다.</p><div className="mode-grid"><button className={setupMode === 'REGULAR' ? 'selected' : undefined} onClick={() => setSetupMode('REGULAR')}>1군<span>현역 1군 선수</span></button><button className={setupMode === 'ALL' ? 'selected' : undefined} onClick={() => setSetupMode('ALL')}>1군 + 퓨처스<span>더 넓은 로스터</span></button></div><StaffToggle includeStaff={includeStaff} onChange={setIncludeStaff} /><div className="team-picker"><div><b>출제 구단</b><button onClick={() => setSelectedTeams(selectedTeams.length === teamOptions.length ? [] : teamOptions)}>{selectedTeams.length === teamOptions.length ? '전체 해제' : '전체 선택'}</button></div><div className="team-list">{teamOptions.map(team => <button className={selectedTeams.includes(team) ? 'selected' : undefined} key={team} onClick={() => setSelectedTeams(previous => previous.includes(team) ? previous.filter(value => value !== team) : [...previous, team])}>{team}</button>)}</div></div><button className="start-game" disabled={selectedTeams.length === 0 || isStartingGame} onClick={() => start(setupMode)}>{isStartingGame ? '게임 시작 중…' : '선택한 구단으로 시작하기'}</button>{message && <div className="notice">{message}</div>}</section></main>

  return (
    <main className="app">
      <header>
        <button className="brand" onClick={returnToSetup}>KBO GUESS</button>
        <div className="header-actions"><button className="share-button" onClick={copyShareLink} aria-label="게임 링크 공유하기" title={isShareCopied ? '복사됐습니다' : '게임 링크 공유하기'}><span className="share-figure" aria-hidden="true"><i>?</i><span>KBO</span><i>?</i></span><b>{isShareCopied ? '복사됨' : '공유'}</b></button><button className="theme-toggle" onClick={() => setIsDarkMode(value => !value)}>{isDarkMode ? '라이트 모드' : '다크 모드'}</button></div>
      </header>
      <section className="hero"><p className="eyebrow">{mode === 'REGULAR' ? 'REGULAR ROSTER' : 'ALL ROSTER'}</p><h1>선수 맞추기</h1></section>
      <section className="board">
        <div className="grid header"><span>선수</span>{fields.map(([, label]) => <span key={label}>{label}</span>)}</div>
        {guesses.map((guess, index) => <div className="grid row" key={`${guess.picked.id}-${index}`}><strong>{guess.picked.name}<small>{guess.picked.team}</small></strong>{fields.map(([key, , valueKey]) => <div className={`cell ${guess.compare[key].status.toLowerCase()}`} key={key}>{String(guess.picked[valueKey])}<em>{statusText[guess.compare[key].status]}</em></div>)}</div>)}
      </section>
      <div className="game-status"><p>{meta}</p>{message && <div className="notice">{message}</div>}</div>
      <section className="current-teams"><b>현재 출제 구단</b><div>{gameTeams.map(team => <span key={team}>{team}</span>)}</div></section>
      <section className="search">
        <div className="search-row">
          <div className="search-input" onBlur={event => {
            const container = event.currentTarget
            window.setTimeout(() => {
              if (!container.contains(document.activeElement)) { setPlayers([]); setActivePlayerIndex(-1) }
            }, 0)
          }}>
            <input ref={searchInputRef} autoFocus disabled={finished || isSubmitting} value={query} onChange={event => { setQuery(event.target.value); setActivePlayerIndex(-1) }} onFocus={() => {
              if (!finished && mode && query.trim().length >= 2) api.search(query.trim(), mode, gameIncludesStaff, gameTeams).then(results => {
                setPlayers(results)
                setActivePlayerIndex(results.length > 0 ? 0 : -1)
              }).catch(() => { setPlayers([]); setActivePlayerIndex(-1) })
            }} onKeyDown={event => {
              if (event.key === 'Escape') { event.preventDefault(); setPlayers([]); setActivePlayerIndex(-1); event.currentTarget.blur(); return }
              if (players.length === 0) return
              if (event.key === 'ArrowDown') { event.preventDefault(); setActivePlayerIndex(index => index >= players.length - 1 ? 0 : index + 1) }
              else if (event.key === 'ArrowUp') { event.preventDefault(); setActivePlayerIndex(index => index <= 0 ? players.length - 1 : index - 1) }
              else if (event.key === 'Enter' && activePlayerIndex >= 0) { event.preventDefault(); selectPlayer(players[activePlayerIndex]) }
            }} placeholder="선수명 2글자 이상 입력" />
            {players.length > 0 && <div className="suggestions">{players.map((player, index) => <button disabled={isSubmitting} className={index === activePlayerIndex ? 'active' : undefined} ref={index === activePlayerIndex ? activePlayerRef : undefined} key={player.id} onClick={() => selectPlayer(player)}><b>{player.name}</b><span>{player.team} · {player.position} · {player.birthYear}년생</span></button>)}</div>}
          </div>
          <button className="reset" disabled={isStartingGame} onClick={() => start(mode)}>{isStartingGame ? '불러오는 중…' : '새 게임 시작'}</button>
          <button className="team-select" onClick={() => setIsTeamPickerOpen(true)}>구단 변경</button>
        </div>
      </section>
      {answer && <section className="answer"><p>정답 선수</p><h2>{answer.name}</h2><span>{answer.team} · {answer.backNo}번 · {answer.position} · {answer.height}cm / {answer.weight}kg</span><button className="result-copy" onClick={copyResult}>{isResultCopied ? '결과 복사됨' : '결과 복사하기'}</button></section>}
      {isTeamPickerOpen && <div className="game-modal-backdrop" onMouseDown={() => setIsTeamPickerOpen(false)}><section className="game-modal" role="dialog" aria-modal="true" aria-label="다음 게임 설정" onMouseDown={event => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">NEXT GAME</p><h2>다음 게임 출제 구단</h2></div><button onClick={() => setIsTeamPickerOpen(false)} aria-label="닫기">×</button></div><p>게임을 시작하면 아래 설정으로 새로운 정답 선수가 출제됩니다.</p><div className="modal-mode-grid"><button className={setupMode === 'REGULAR' ? 'selected' : undefined} onClick={() => setSetupMode('REGULAR')}>1군<span>현역 1군 선수</span></button><button className={setupMode === 'ALL' ? 'selected' : undefined} onClick={() => setSetupMode('ALL')}>1군 + 퓨처스<span>더 넓은 로스터</span></button></div><StaffToggle includeStaff={includeStaff} onChange={setIncludeStaff} modal /><div className="modal-team-picker"><b>출제 구단</b><button onClick={() => setSelectedTeams(selectedTeams.length === teamOptions.length ? [] : teamOptions)}>{selectedTeams.length === teamOptions.length ? '전체 해제' : '전체 선택'}</button><div className="team-list">{teamOptions.map(team => <button className={selectedTeams.includes(team) ? 'selected' : undefined} key={team} onClick={() => setSelectedTeams(previous => previous.includes(team) ? previous.filter(value => value !== team) : [...previous, team])}>{team}</button>)}</div></div><button className="modal-start-game" disabled={selectedTeams.length === 0 || isStartingGame} onClick={() => start(setupMode)}>{isStartingGame ? '게임 시작 중…' : '새 게임 시작'}</button></section></div>}
    </main>
  )
}
