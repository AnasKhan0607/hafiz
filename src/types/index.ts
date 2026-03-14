export interface FlashCard {
  id: string
  arabic: string
  english: string
  notes?: string
}

export interface Deck {
  id: string
  name: string
  cards: FlashCard[]
  createdAt: string
}

export interface QuizResult {
  cardId: string
  correct: boolean
  timeSpent: number
}
