'use client'

import { useState, useEffect } from 'react'
import { Deck, FlashCard } from '@/types'

interface QuizModeProps {
  deck: Deck
  direction: 'en-ar' | 'ar-en'
  onBack: () => void
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function QuizMode({ deck, direction, onBack }: QuizModeProps) {
  const [shuffledCards, setShuffledCards] = useState<FlashCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({ correct: 0, incorrect: 0 })
  const [quizComplete, setQuizComplete] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState<FlashCard[]>([])

  useEffect(() => {
    setShuffledCards(shuffleArray(deck.cards))
  }, [deck.cards])

  const currentCard = shuffledCards[currentIndex]

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }))
    } else {
      setResults(prev => ({ ...prev, incorrect: prev.incorrect + 1 }))
      setWrongAnswers(prev => [...prev, currentCard])
    }

    if (currentIndex + 1 >= shuffledCards.length) {
      setQuizComplete(true)
    } else {
      setShowAnswer(false)
      setCurrentIndex(prev => prev + 1)
    }
  }

  const restartQuiz = () => {
    setShuffledCards(shuffleArray(deck.cards))
    setCurrentIndex(0)
    setShowAnswer(false)
    setResults({ correct: 0, incorrect: 0 })
    setQuizComplete(false)
    setWrongAnswers([])
  }

  const practiceWrongAnswers = () => {
    setShuffledCards(shuffleArray(wrongAnswers))
    setCurrentIndex(0)
    setShowAnswer(false)
    setResults({ correct: 0, incorrect: 0 })
    setQuizComplete(false)
    setWrongAnswers([])
  }

  if (shuffledCards.length === 0) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (quizComplete) {
    const percentage = Math.round((results.correct / shuffledCards.length) * 100)
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-emerald-800 mb-2">Quiz Complete!</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-emerald-600">{results.correct}</span> out of{' '}
            <span className="font-bold">{shuffledCards.length}</span> ({percentage}%)
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600">{results.correct}</div>
              <div className="text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500">{results.incorrect}</div>
              <div className="text-gray-500">Incorrect</div>
            </div>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">Words to Review:</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {wrongAnswers.map(card => (
                  <span key={card.id} className="px-3 py-1 bg-white rounded-full text-sm">
                    <span className="arabic">{card.arabic}</span> • {card.english}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button onClick={onBack} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Back to Deck
            </button>
            {wrongAnswers.length > 0 && (
              <button onClick={practiceWrongAnswers} className="btn-gold">
                Practice Wrong Answers
              </button>
            )}
            <button onClick={restartQuiz} className="btn-islamic">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
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
        Exit Quiz
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentIndex + 1} of {shuffledCards.length}</span>
            <span>
              <span className="text-emerald-600">{results.correct} ✓</span>
              {' • '}
              <span className="text-red-500">{results.incorrect} ✗</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex) / shuffledCards.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Direction Indicator */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            {direction === 'en-ar' ? 'English → Arabic' : 'Arabic → English'}
          </span>
        </div>

        {/* Question */}
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">What is the translation of:</p>
          {direction === 'en-ar' ? (
            <p className="text-4xl font-bold text-emerald-800">{currentCard.english}</p>
          ) : (
            <p className="arabic text-5xl text-emerald-800">{currentCard.arabic}</p>
          )}
        </div>

        {/* Answer */}
        {showAnswer ? (
          <div className="text-center py-8 bg-emerald-50 rounded-xl mb-6">
            <p className="text-gray-500 mb-2">Answer:</p>
            {direction === 'en-ar' ? (
              <p className="arabic text-5xl text-emerald-800">{currentCard.arabic}</p>
            ) : (
              <p className="text-4xl font-bold text-emerald-800">{currentCard.english}</p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors mb-6"
          >
            Reveal Answer
          </button>
        )}

        {/* Answer Buttons */}
        {showAnswer && (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-4 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Got it Wrong
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Got it Right
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
