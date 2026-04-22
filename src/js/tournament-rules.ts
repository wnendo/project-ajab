import { ChampionshipCategory, CompetitionGroup, RankingMode, TournamentRegistration, TournamentType, UpcomingTournament } from "./types"

export const CHAMPIONSHIP_CATEGORIES: ChampionshipCategory[] = ["A", "B", "C", "D", "Iniciante"]

function normalizeCategory(value?: string) {
  return (value ?? "").trim().toUpperCase()
}

function normalizeChampionshipCategory(value?: string): ChampionshipCategory | null {
  const normalized = normalizeCategory(value)

  if (normalized === "A") return "A"
  if (normalized === "B") return "B"
  if (normalized === "C") return "C"
  if (normalized === "D") return "D"
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  return null
}

export function normalizeRegistrationCategory(value?: string) {
  const normalized = normalizeCategory(value)
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  if (["A", "B", "C", "D"].includes(normalized)) return normalized
  return null
}

export function getTournamentType(tournament?: UpcomingTournament | null): TournamentType {
  return tournament?.tournamentType ?? "championship"
}

export function isRankingTournament(tournament?: UpcomingTournament | null) {
  return getTournamentType(tournament) === "ranking"
}

export function getRankingMode(tournament?: UpcomingTournament | null): RankingMode {
  return tournament?.rankingMode ?? "single"
}

export function getCompetitionGroups(tournament?: UpcomingTournament | null): CompetitionGroup[] {
  if (!isRankingTournament(tournament)) {
    return ["general"]
  }

  return getRankingMode(tournament) === "split" ? ["A", "B"] : ["general"]
}

export function getGroupLabel(group: CompetitionGroup) {
  if (group === "A") return "Categoria A"
  if (group === "B") return "Categoria B"
  return "Geral"
}

export function getRankingRegistrationOptions(playerCategory?: string) {
  const normalized = normalizeCategory(playerCategory)

  if (["A", "B", "C"].includes(normalized)) {
    return ["A"]
  }

  if (["D", "INICIANTE", "INICIANTES"].includes(normalized)) {
    return ["B"]
  }

  return []
}

export function getChampionshipRegistrationOptions(playerCategory?: string): ChampionshipCategory[] {
  const normalized = normalizeChampionshipCategory(playerCategory)

  if (normalized === "A") return ["A"]
  if (normalized === "B") return ["A", "B"]
  if (normalized === "C") return ["A", "B", "C"]
  if (normalized === "D") return ["A", "B", "C", "D"]
  if (normalized === "Iniciante") return ["Iniciante"]
  return []
}

export function formatRegistrationCategories(categories: string[]) {
  return categories.join(", ")
}

export function parseRegistrationCategories(registration: Pick<TournamentRegistration, "categories" | "category">) {
  const source = Array.isArray(registration.categories)
    ? registration.categories
    : String(registration.category ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)

  return [...new Set(source.map((entry) => normalizeRegistrationCategory(entry)).filter(Boolean))] as string[]
}

export function getCategoryLimit(tournament: UpcomingTournament, category: string) {
  const normalized = normalizeRegistrationCategory(category)
  if (!normalized) return undefined
  const raw = tournament.categoryLimits?.[normalized]
  if (typeof raw !== "number" || raw <= 0) return undefined
  return raw
}

export function getCategoryRegistrationCount(registrations: TournamentRegistration[], category: string) {
  const normalized = normalizeRegistrationCategory(category)
  if (!normalized) return 0
  return registrations.filter((registration) => parseRegistrationCategories(registration).includes(normalized)).length
}

export function isCategoryFull(
  tournament: UpcomingTournament,
  registrations: TournamentRegistration[],
  category: string
) {
  const limit = getCategoryLimit(tournament, category)
  if (!limit) return false
  return getCategoryRegistrationCount(registrations, category) >= limit
}

export function getRegistrationFeeForSelection(
  tournament: UpcomingTournament,
  selectedCategories: string[] | number
) {
  const selectionCount = typeof selectedCategories === "number" ? selectedCategories : selectedCategories.length

  if (!isRankingTournament(tournament) && selectionCount > 1) {
    return tournament.doubleRegistrationFee ?? tournament.registrationFee
  }

  return tournament.registrationFee
}

export function isValidChampionshipSelection(playerCategory: string | undefined, selectedCategories: string[]) {
  const allowed = getChampionshipRegistrationOptions(playerCategory)
  if (!selectedCategories.length) {
    return false
  }

  const uniqueSelected = [...new Set(selectedCategories.map((item) => normalizeChampionshipCategory(item)).filter(Boolean))]
  return uniqueSelected.length === selectedCategories.length && uniqueSelected.every((item) => allowed.includes(item))
}

export function getAllowedRegistrationCategories(tournament: UpcomingTournament, playerCategory?: string) {
  if (isRankingTournament(tournament)) {
    return getRankingRegistrationOptions(playerCategory)
  }

  const championshipOptions = getChampionshipRegistrationOptions(playerCategory)
  if (championshipOptions.length) {
    const tournamentCategories = Array.isArray(tournament.categories)
      ? tournament.categories.map((entry) => normalizeChampionshipCategory(entry)).filter(Boolean)
      : []

    return championshipOptions.filter((category) => {
      if (tournamentCategories.length) {
        return tournamentCategories.includes(category)
      }

      return true
    })
  }

  if (Array.isArray(tournament.categories) && tournament.categories.length) {
    return tournament.categories
  }

  if (tournament.category) {
    return tournament.category.split(",").map((item) => item.trim()).filter(Boolean)
  }

  return playerCategory ? [playerCategory] : ["Livre"]
}

export function getPlayerCompetitionGroup(
  tournament: UpcomingTournament | null | undefined,
  registrationCategory?: string
): CompetitionGroup {
  if (!isRankingTournament(tournament)) {
    return "general"
  }

  if (getRankingMode(tournament) !== "split") {
    return "general"
  }

  return normalizeCategory(registrationCategory) === "B" ? "B" : "A"
}
