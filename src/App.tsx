import { useEffect, useMemo, useRef, useState } from 'react'
import { api, type Guess, type Mode, type PickedPlayer, type Player, type Status } from './api'

const MAX_TRIES = 8
const fields: Array<[keyof Guess['compare'], string, keyof PickedPlayer]> = [
  ['team', '구단', 'team'], ['backNo', '등번호', 'backNo'], ['position', '포지션', 'position'], ['throwingHand', '투구', 'throwingHand'], ['battingSide', '타석', 'battingSide'], ['birthYear', '출생연도', 'birthYear'], ['height', '키', 'height'], ['weight', '몸무게', 'weight'],
]
const statusText: Record<Status, string> = { MATCH: '', MISMATCH: '', UP: '↑', DOWN: '↓' }

function gameIdFromPath() {
  const match = window.location.pathname.match(/^\/game\/([\w-]+)$/)
  return match?.[1] ?? crypto.randomUUID()
}

export default function App() {
  const [gameId] = useState(gameIdFromPath)
  const [mode, setMode] = useState<Mode | null>(null)
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [activePlayerIndex, setActivePlayerIndex] = useState(-1)
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [answer, setAnswer] = useState<PickedPlayer | null>(null)
  const [meta, setMeta] = useState('로딩 중…')
  const [message, setMessage] = useState<string | null>(null)
  const activePlayerRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const finished = Boolean(answer)

  const canSearch = useMemo(() => query.trim().length >= 2 && mode && !finished, [query, mode, finished])

  async function updateMeta(tries = guesses.length) {
    const state = await api.state(gameId)
    const date = state.rosterDate?.replaceAll('-', '.') ?? '동기화 전'
    setMeta(`선수 명단 기준일: ${date} · 선수 수: ${state.playerCount}명 · 시도: ${tries}/${MAX_TRIES}`)
  }
  async function showAnswer() { setAnswer(await api.answer(gameId)) }
  async function reset(nextMode: Mode) {
    try {
      await api.reset(gameId, nextMode)
      setGuesses([]); setAnswer(null); setQuery(''); setPlayers([]); setActivePlayerIndex(-1); setMessage(null)
      await updateMeta(0)
    } catch { setMessage('게임을 초기화하지 못했습니다. 백엔드 연결을 확인해주세요.') }
  }
  async function start(nextMode: Mode) {
    if (!window.location.pathname.startsWith('/game/')) window.history.replaceState(null, '', `/game/${gameId}`)
    setMode(nextMode)
    await reset(nextMode)
  }
  async function selectPlayer(player: Player) {
    if (!mode || finished || guesses.length >= MAX_TRIES) return
    try {
      const result = await api.guess(gameId, player.id)
      const nextCount = guesses.length + 1
      setGuesses(previous => [...previous, result]); setQuery(''); setPlayers([]); setActivePlayerIndex(-1)
      await updateMeta(nextCount)
      if (result.isCorrect) { await showAnswer(); setMessage(`정답입니다! ${result.picked.name} 선수를 맞혔어요.`) }
      else if (nextCount >= MAX_TRIES) { await showAnswer(); setMessage('시도 횟수를 모두 사용했습니다.') }
    } catch { setMessage('추리 요청에 실패했습니다. 잠시 후 다시 시도해주세요.') }
  }

  useEffect(() => {
    if (!canSearch || !mode) { setPlayers([]); setActivePlayerIndex(-1); return }
    const timer = window.setTimeout(() => api.search(query.trim(), mode).then(results => {
      setPlayers(results)
      setActivePlayerIndex(results.length > 0 ? 0 : -1)
    }).catch(() => { setPlayers([]); setActivePlayerIndex(-1) }), 250)
    return () => window.clearTimeout(timer)
  }, [query, mode, canSearch])

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

  if (!mode) return <main className="landing"><section><p className="eyebrow">KBO PLAYER GUESS</p><h1>KBO 선수를<br />맞혀보세요.</h1><p>선수 정보를 비교하며 8번 안에 정답을 찾아보세요.</p><div className="mode-grid"><button onClick={() => start('REGULAR')}>1군<span>현역 1군 선수</span></button><button onClick={() => start('ALL')}>1군 + 퓨처스<span>더 넓은 로스터</span></button></div></section></main>

  return (
    <main className="app">
      <header>
        <button className="brand" onClick={() => setMode(null)}>KBO GUESS</button>
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
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { setPlayers([]); setActivePlayerIndex(-1) }
          }}>
            <input ref={searchInputRef} autoFocus disabled={finished} value={query} onChange={event => { setQuery(event.target.value); setActivePlayerIndex(-1) }} onFocus={() => {
              if (!finished && mode && query.trim().length >= 2) api.search(query.trim(), mode).then(results => {
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
            {players.length > 0 && <div className="suggestions">{players.map((player, index) => <button className={index === activePlayerIndex ? 'active' : undefined} ref={index === activePlayerIndex ? activePlayerRef : undefined} key={player.id} onClick={() => selectPlayer(player)}><b>{player.name}</b><span>{player.team} · {player.position} · {player.birthYear}년생</span></button>)}</div>}
          </div>
          <button className="reset" onClick={() => reset(mode)}>새 게임 시작</button>
        </div>
      </section>
      {answer && <section className="answer"><p>정답 선수</p><h2>{answer.name}</h2><span>{answer.team} · {answer.backNo}번 · {answer.position} · {answer.height}cm / {answer.weight}kg</span></section>}
    </main>
  )
}
