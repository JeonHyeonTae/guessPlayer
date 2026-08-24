import { useEffect, useMemo, useRef, useState } from 'react'
import { api, type Guess, type Mode, type PickedPlayer, type Player, type Status } from './api'

const MAX_TRIES = 8
const fields: Array<[keyof Guess['compare'], string, keyof PickedPlayer]> = [
  ['team', '구단', 'team'], ['backNo', '등번호', 'backNo'], ['position', '포지션', 'position'], ['throwingHand', '투구', 'throwingHand'], ['battingSide', '타석', 'battingSide'], ['birthYear', '출생연도', 'birthYear'], ['height', '키', 'height'], ['weight', '몸무게', 'weight'],
]
const statusText: Record<Status, string> = { MATCH: '', MISMATCH: '', UP: '↑', DOWN: '↓' }

function gameIdFromPath() {
  const match = window.location.pathname.match(/^\/game\/([\w-]+)$/)
  return match?.[1] ?? null
}

export default function App() {
  const [gameId, setGameId] = useState(gameIdFromPath)
  const [mode, setMode] = useState<Mode | null>(null)
  const [setupMode, setSetupMode] = useState<Mode>('REGULAR')
  const [teamOptions, setTeamOptions] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [gameTeams, setGameTeams] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [answer, setAnswer] = useState<PickedPlayer | null>(null)
  const [meta, setMeta] = useState('로딩 중…')
  const [message, setMessage] = useState<string | null>(null)
  const activePlayerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const submittingRef = useRef(false)
  const finished = Boolean(answer)

  const canSearch = useMemo(() => query.trim().length >= 2 && mode && !finished, [query, mode, finished])

  function setMetaFromState(state: { rosterDate: string | null; playerCount: number }, tries = guesses.length) {
    const date = state.rosterDate?.replaceAll('-', '.') ?? '동기화 전'
    setMeta(`선수 명단 기준일: ${date} · 선수 수: ${state.playerCount}명 · 시도: ${tries}/${MAX_TRIES}`)
  }
  async function updateMeta(tries = guesses.length) {
    if (!gameId) return
    setMetaFromState(await api.state(gameId), tries)
  }
  async function showAnswer() { if (gameId) setAnswer(await api.answer(gameId)) }
  async function reset(nextMode: Mode) {
    if (!gameId) return
    try {
      await api.reset(gameId, nextMode)
      setGuesses([]); setAnswer(null); setQuery(''); setPlayers([]); setActivePlayerIndex(-1); setMessage(null)
      await updateMeta(0)
    } catch { setMessage('게임을 초기화하지 못했습니다. 백엔드 연결을 확인해주세요.') }
  }
  async function start(nextMode: Mode) {
    if (selectedTeams.length === 0) { setMessage('한 개 이상의 구단을 선택해주세요.'); return }
    try {
      const game = await api.create(nextMode, selectedTeams)
      setGameId(game.gameId)
      window.history.replaceState(null, '', `/game/${game.gameId}`)
      setMode(game.mode)
      setGameTeams(game.teams)
      setGuesses([]); setAnswer(null); setQuery(''); setPlayers([]); setActivePlayerIndex(-1); setMessage(null)
      setMetaFromState(game, 0)
    } catch { setMessage('새 게임을 시작하지 못했습니다. 백엔드 연결을 확인해주세요.') }
  }
  function returnToSetup() {
    setGameId(null)
    setMode(null)
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
    submittingRef.current = true
    setIsSubmitting(true)
    setPlayers([])
    setActivePlayerIndex(-1)
    try {
      const result = await api.guess(gameId, player.id)
      const nextCount = guesses.length + 1
      setGuesses(previous => [...previous, result]); setQuery(''); setPlayers([]); setActivePlayerIndex(-1)
      await updateMeta(nextCount)
      if (result.isCorrect) { await showAnswer(); setMessage(`정답입니다! ${result.picked.name} 선수를 맞혔어요.`) }
      else if (nextCount >= MAX_TRIES) { await showAnswer(); setMessage('시도 횟수를 모두 사용했습니다.') }
    } catch { setMessage('추리 요청에 실패했습니다. 잠시 후 다시 시도해주세요.') }
    finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!gameId) { setMeta('게임을 선택해주세요.'); return }
    api.state(gameId).then(state => {
      setMode(state.mode)
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
    const timer = window.setTimeout(() => api.search(query.trim(), mode, gameTeams).then(results => {
      setPlayers(results)
      setActivePlayerIndex(results.length > 0 ? 0 : -1)
    }).catch(() => { setPlayers([]); setActivePlayerIndex(-1) }), 250)
    return () => window.clearTimeout(timer)
  }, [query, mode, gameTeams, canSearch])

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

  if (!mode) return <main className="landing"><section><p className="eyebrow">KBO PLAYER GUESS</p><h1>KBO 선수를<br />맞혀보세요.</h1><p>구단을 선택하면 해당 구단 선수 중 한 명이 정답으로 출제됩니다.</p><div className="mode-grid"><button className={setupMode === 'REGULAR' ? 'selected' : undefined} onClick={() => setSetupMode('REGULAR')}>1군<span>현역 1군 선수</span></button><button className={setupMode === 'ALL' ? 'selected' : undefined} onClick={() => setSetupMode('ALL')}>1군 + 퓨처스<span>더 넓은 로스터</span></button></div><div className="team-picker"><div><b>출제 구단</b><button onClick={() => setSelectedTeams(selectedTeams.length === teamOptions.length ? [] : teamOptions)}>{selectedTeams.length === teamOptions.length ? '전체 해제' : '전체 선택'}</button></div><div className="team-list">{teamOptions.map(team => <button className={selectedTeams.includes(team) ? 'selected' : undefined} key={team} onClick={() => setSelectedTeams(previous => previous.includes(team) ? previous.filter(value => value !== team) : [...previous, team])}>{team}</button>)}</div></div><button className="start-game" disabled={selectedTeams.length === 0} onClick={() => start(setupMode)}>선택한 구단으로 시작하기</button>{message && <div className="notice">{message}</div>}</section></main>

  return (
    <main className="app">
      <header>
        <button className="brand" onClick={returnToSetup}>KBO GUESS</button>
        <button className="mode-switch" onClick={() => start(mode === 'REGULAR' ? 'ALL' : 'REGULAR')}>{mode === 'REGULAR' ? '퓨처스 포함하기' : '1군만 보기'}</button>
      </header>
      <section className="hero"><p className="eyebrow">{mode === 'REGULAR' ? 'REGULAR ROSTER' : 'ALL ROSTER'}</p><h1>선수 맞추기</h1></section>
      <section className="board">
        <div className="grid header"><span>선수</span>{fields.map(([, label]) => <span key={label}>{label}</span>)}</div>
        {guesses.map((guess, index) => <div className="grid row" key={`${guess.picked.id}-${index}`}><strong>{guess.picked.name}<small>{guess.picked.team}</small></strong>{fields.map(([key, , valueKey]) => <div className={`cell ${guess.compare[key].status.toLowerCase()}`} key={key}>{String(guess.picked[valueKey])}<em>{statusText[guess.compare[key].status]}</em></div>)}</div>)}
      </section>
      <div className="game-status"><p>{meta}</p>{message && <div className="notice">{message}</div>}</div>
      <section className="search">
        <div className="search-row">
          <div className="search-input" onBlur={event => {
            const container = event.currentTarget
            window.setTimeout(() => {
              if (!container.contains(document.activeElement)) { setPlayers([]); setActivePlayerIndex(-1) }
            }, 0)
          }}>
            <input ref={searchInputRef} autoFocus disabled={finished || isSubmitting} value={query} onChange={event => { setQuery(event.target.value); setActivePlayerIndex(-1) }} onFocus={() => {
              if (!finished && mode && query.trim().length >= 2) api.search(query.trim(), mode, gameTeams).then(results => {
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
          <button className="reset" onClick={() => start(mode)}>새 게임 시작</button>
        </div>
      </section>
      {answer && <section className="answer"><p>정답 선수</p><h2>{answer.name}</h2><span>{answer.team} · {answer.backNo}번 · {answer.position} · {answer.height}cm / {answer.weight}kg</span></section>}
    </main>
  )
}
