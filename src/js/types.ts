export type PlayerProfile = {
  wins: number
  losses: number
  games: number
  active: boolean
  createdAt?: number
  lastPlayed?: number
}

export type Player = {
  id: string
  name: string
  wins: number
  losses: number
  games: number
  active: boolean
  createdAt?: number
  lastPlayed?: number
}

export type Match = {
  id: string
  p1: string
  p2: string
  score1: number
  score2: number
  winner: string
  createdAt: number
  tournamentId?: string
  tournamentTitle?: string
  tableLabel?: string
}

export type Table = {
  id: number
  p1?: Player
  p2?: Player
}

export type User = {
  id: string
  name: string
  email: string
  phone: string
  club: string
  category: string
  photoURL?: string
  role: "user" | "admin"
  createdAt: number
  updatedAt?: number
  profileComplete: boolean
  playerProfile?: PlayerProfile
}

export type UserTournament = {
  id: string
  tournamentId?: string
  title: string
  category: string
  placement?: string
  result?: string
  matchCount?: number
  wins?: number
  losses?: number
  playedAt: number
}

export type UserMatchHistory = {
  id: string
  tournamentId?: string
  tournamentTitle?: string
  opponentName: string
  scoreLabel: string
  stage?: string
  tableLabel?: string
  result: "win" | "loss"
  playedAt: number
}

export type UpcomingTournament = {
  id: string
  title: string
  location?: string
  description?: string
  category?: string
  startDate: number
  endDate?: number
  registrationDeadline?: number
  status?: "upcoming" | "open" | "closed" | "finished"
  isActive?: boolean
  createdAt?: number
  updatedAt?: number
}
