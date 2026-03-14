'use client'

import { useState } from 'react'
import { Deck } from '@/types'

interface FlashcardDeckProps {
  deck: Deck
  onBack: () => void
  onStartQuiz: (direction: 'en-ar' | 'ar-en') => void
}

export default function FlashcardDeck({ deck, onBack, onStartQuiz }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showArabicFirst, setShowArabicFirst] = useState(true)

  const currentCard = deck.cards[currentIndex]

  const nextCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.cards.length)
    }, 150)
  }

  const prevCard = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.cards.length) % deck.cards.length)
    }, 150)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Decks
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-emerald-800">{deck.name}</h2>
          <span className="text-gray-500">
            {currentIndex + 1} / {deck.cards.length}
          </span>
        </div>

        {/* Toggle Direction */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { setShowArabicFirst(true); setIsFlipped(false); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showArabicFirst 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Arabic First
          </button>
          <button
            onClick={() => { setShowArabicFirst(false); setIsFlipped(false); }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !showArabicFirst 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            English First
          </button>
        </div>

        {/* Flashcard */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`flashcard cursor-pointer mb-6 ${isFlipped ? 'flipped' : ''}`}
        >
          <div className="flashcard-inner relative h-64">
            {/* Front */}
            <div className="flashcard-front absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center p-8 text-white shadow-lg">
              <div className="text-center">
                {showArabicFirst ? (
                  <p className="arabic text-4xl">{currentCard.arabic}</p>
                ) : (
                  <p className="text-3xl font-semibold">{currentCard.english}</p>
                )}
                <p className="text-emerald-200 text-sm mt-4">Tap to reveal</p>
              </div>
            </div>
            
            {/* Back */}
            <div className="flashcard-back absolute inset-0 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center p-8 text-white shadow-lg">
              <div className="text-center">
                {showArabicFirst ? (
                  <p className="text-3xl font-semibold">{currentCard.english}</p>
                ) : (
                  <p className="arabic text-4xl">{currentCard.arabic}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevCard}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <button
            onClick={nextCard}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Next
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Quiz Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Ready to test yourself?</h3>
          <div className="flex gap-4">
            <button
              onClick={() => onStartQuiz('en-ar')}
              className="flex-1 btn-gold"
            >
              Quiz: English → Arabic
            </button>
            <button
              onClick={() => onStartQuiz('ar-en')}
              className="flex-1 btn-islamic"
            >
              Quiz: Arabic → English
            </button>
          </div>
        </div>
      </div>

      {/* Card List */}
      <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-emerald-800 mb-4">All Cards in Deck</h3>
        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {deck.cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => { setCurrentIndex(index); setIsFlipped(false); }}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                index === currentIndex
                  ? 'bg-emerald-100 border-2 border-emerald-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className="arabic text-lg">{card.arabic}</span>
              <span className="text-gray-600">{card.english}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
