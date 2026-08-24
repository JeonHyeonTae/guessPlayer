export type Mode = 'REGULAR' | 'ALL'
export type Status = 'MATCH' | 'MISMATCH' | 'UP' | 'DOWN'

export interface Player { id: number; name: string; team: string; position: string; birthYear: number }
export interface PickedPlayer extends Player { backNo: number; throwingHand: string; battingSide: string; age: number; height: number; weight: number }
export interface Guess { picked: PickedPlayer; compare: Record<'team' | 'backNo' | 'position' | 'throwingHand' | 'battingSide' | 'birthYear' | 'height' | 'weight', { status: Status }>; isCorrect: boolean }
export interface GameState { rosterDate: string | null; playerCount: number }

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.solusi.co.kr/api/v1').replace(/\/$/, '')
const endpoint = (path: string) => `${baseUrl}${path}`

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(endpoint(path), init)
  if (!response.ok) throw new Error(`API 요청 실패 (${response.status})`)
  const payload: unknown = await response.json()
  if (isApiEnvelope(payload)) {
    if (!payload.success) throw new Error(payload.message || 'API 요청 실패')
    return payload.data as T
  }
  return payload as T
}

function isApiEnvelope(value: unknown): value is { success: boolean; message?: string; data: unknown } {
  return typeof value === 'object' && value !== null && 'success' in value && 'data' in value
}

export const api = {
  search: (query: string, mode: Mode) => request<Player[]>(`/kbo/players/search?query=${encodeURIComponent(query)}&mode=${mode}`),
  state: (gameId: string) => request<GameState>(`/kbo/games/${encodeURIComponent(gameId)}/state`),
  guess: (gameId: string, playerId: number) => request<Guess>(`/kbo/games/${encodeURIComponent(gameId)}/guesses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId }) }),
  reset: (gameId: string, mode: Mode) => request<GameState>(`/kbo/games/${encodeURIComponent(gameId)}/reset?mode=${mode}`, { method: 'POST' }),
  answer: (gameId: string) => request<PickedPlayer>(`/kbo/games/${encodeURIComponent(gameId)}/answer`),
}
