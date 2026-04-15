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
  registrationCategory?: string
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
  group?: CompetitionGroup
  registrationCategory?: string
}

export type Table = {
  id: number
  group: CompetitionGroup
  p1?: Player
  p2?: Player
}

export type CompetitionGroup = "general" | "A" | "B"
export type ChampionshipCategory = "A" | "B" | "C" | "D" | "Iniciante"

export type TournamentType = "championship" | "ranking"
export type RankingMode = "single" | "split"

export type TournamentGroupState = {
  started?: boolean
  tableCount?: number
}

export type RankingLiveMatch = {
  playerIds: [string, string]
}

export type RankingLiveTable = {
  id: number
  playerIds?: [string, string]
}

export type RankingLiveGroupState = {
  queue?: RankingLiveMatch[]
  activeTables?: RankingLiveTable[]
}

export type RankingLiveState = Partial<Record<CompetitionGroup, RankingLiveGroupState>>

export type ChampionshipGroup = {
  id: string
  name: string
  playerIds: string[]
}

export type ChampionshipMatch = {
  id: string
  stage: "groups" | "knockout"
  category: ChampionshipCategory
  groupId?: string
  roundIndex?: number
  roundTitle?: string
  slot?: number
  playerIds: [string, string]
  score1?: number
  score2?: number
  winnerId?: string
  playedAt?: number
}

export type ChampionshipTable = {
  id: number
  groupId?: string
  match?: ChampionshipMatch
}

export type ChampionshipCategoryState = {
  groupSize?: number
  groups?: ChampionshipGroup[]
  defined?: boolean
  started?: boolean
  knockoutStarted?: boolean
  finished?: boolean
  tableCount?: number
  queue?: ChampionshipMatch[]
  activeTables?: ChampionshipTable[]
  completedMatches?: ChampionshipMatch[]
  finalStandings?: string[]
}

export type ChampionshipState = Partial<Record<ChampionshipCategory, ChampionshipCategoryState>>

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

export type UserTournamentRegistration = {
  id: string
  tournamentId: string
  title: string
  location?: string
  category?: string
  categories?: string[]
  registrationFee?: number
  paymentStatus: "pending_payment" | "approved"
  paymentMethod?: "pix" | "pay_on_day"
  startDate?: number
  endDate?: number
  registrationDeadline?: number
  registeredAt: number
  status: "registered"
}

export type TournamentRegistration = {
  id: string
  uid: string
  name: string
  email: string
  club?: string
  category?: string
  categories?: string[]
  registrationFee?: number
  paymentStatus: "pending_payment" | "approved"
  paymentMethod?: "pix" | "pay_on_day"
  registeredAt: number
  status: "registered"
}

export type UpcomingTournament = {
  id: string
  title: string
  tournamentType?: TournamentType
  rankingMode?: RankingMode
  location?: string
  description?: string
  category?: string
  categories?: string[]
  startDate: number
  startTime?: string
  registrationFee?: number
  doubleRegistrationFee?: number
  pixKey?: string
  pixHolder?: string
  endDate?: number
  registrationDeadline?: number
  status?: "upcoming" | "open" | "closed" | "finished"
  isActive?: boolean
  groupStates?: Partial<Record<CompetitionGroup, TournamentGroupState>>
  rankingLiveState?: RankingLiveState
  championshipState?: ChampionshipState
  createdAt?: number
  updatedAt?: number
}
