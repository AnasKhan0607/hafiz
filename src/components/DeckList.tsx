'use client'

import { Deck } from '@/types'

interface DeckListProps {
  decks: Deck[]
  onSelect: (deck: Deck) => void
  onDelete: (deckId: string) => void
  onStartQuiz: (deck: Deck, direction: 'en-ar' | 'ar-en') => void
  onExport?: (deck: Deck) => void
}

export default function DeckList({ decks, onSelect, onDelete, onStartQuiz, onExport }: DeckListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 mb-4">Your Flashcard Decks</h2>
      
      {decks.map((deck) => (
        <div
          key={deck.id}
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-emerald-800">{deck.name}</h3>
              <p className="text-gray-500 text-sm mt-1">
                {deck.cards.length} cards • Created {new Date(deck.createdAt).toLocaleDateString()}
              </p>
              
              {/* Preview cards */}
              <div className="flex flex-wrap gap-2 mt-3">
                {deck.cards.slice(0, 5).map((card) => (
                  <span
                    key={card.id}
                    className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 text-sm rounded"
                  >
                    <span className="arabic text-base mr-1">{card.arabic.split(' - ')[0]}</span>
                    <span className="text-gray-400">•</span>
                    <span className="ml-1">{card.english}</span>
                  </span>
                ))}
                {deck.cards.length > 5 && (
                  <span className="text-gray-400 text-sm">+{deck.cards.length - 5} more</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {onExport && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onExport(deck)
                  }}
                  className="text-gray-400 hover:text-emerald-600 transition-colors p-2"
                  title="Export deck"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Delete this deck?')) {
                    onDelete(deck.id)
                  }
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="Delete deck"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => onSelect(deck)}
              className="flex-1 min-w-[120px] bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              View Cards
            </button>
            <button
              onClick={() => onStartQuiz(deck, 'en-ar')}
              className="flex-1 min-w-[120px] bg-gold-100 hover:bg-gold-200 text-gold-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Quiz: EN → AR
            </button>
            <button
              onClick={() => onStartQuiz(deck, 'ar-en')}
              className="flex-1 min-w-[120px] bg-gold-100 hover:bg-gold-200 text-gold-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Quiz: AR → EN
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
