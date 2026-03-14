'use client'

import { useState, useEffect } from 'react'
import { Deck, FlashCard } from '@/types'

interface LibraryProps {
  onAddDeck: (deck: Deck) => void
  onBack: () => void
  existingDeckIds: string[]
}

interface BookInfo {
  id: string
  name: string
  description: string
  chapters: number
  totalCards: number
  source: string
}

interface ChapterData {
  id: string
  name: string
  source: string
  cards: { id: string; arabic: string; english: string }[]
}

export default function Library({ onAddDeck, onBack, existingDeckIds }: LibraryProps) {
  const [books, setBooks] = useState<BookInfo[]>([])
  const [selectedBook, setSelectedBook] = useState<string | null>(null)
  const [chapters, setChapters] = useState<ChapterData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingChapters, setLoadingChapters] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch('/library/index.json')
      .then(res => res.json())
      .then(data => {
        setBooks(data.books)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const loadBook = async (bookId: string) => {
    setSelectedBook(bookId)
    setLoadingChapters(true)
    setChapters([])

    const book = books.find(b => b.id === bookId)
    if (!book) return

    const loadedChapters: ChapterData[] = []
    
    for (let i = 1; i <= book.chapters; i++) {
      const chapterNum = i.toString().padStart(2, '0')
      try {
        const res = await fetch(`/library/${bookId}/chapter-${chapterNum}.json`)
        if (res.ok) {
          const data = await res.json()
          loadedChapters.push(data)
        }
      } catch (e) {
        console.error(`Failed to load chapter ${i}`)
      }
    }

    setChapters(loadedChapters)
    setLoadingChapters(false)
  }

  const addChapterToDeck = (chapter: ChapterData) => {
    if (existingDeckIds.includes(chapter.id)) {
      setMessage('⚠️ This deck is already in your collection')
      setTimeout(() => setMessage(null), 2000)
      return
    }

    const deck: Deck = {
      id: chapter.id,
      name: chapter.name,
      cards: chapter.cards.map(c => ({
        id: c.id,
        arabic: c.arabic,
        english: c.english
      })),
      createdAt: new Date().toISOString()
    }

    onAddDeck(deck)
    setMessage(`✅ Added "${chapter.name}" to your decks`)
    setTimeout(() => setMessage(null), 2000)
  }

  const addAllChapters = () => {
    let added = 0
    chapters.forEach(chapter => {
      if (!existingDeckIds.includes(chapter.id)) {
        const deck: Deck = {
          id: chapter.id,
          name: chapter.name,
          cards: chapter.cards.map(c => ({
            id: c.id,
            arabic: c.arabic,
            english: c.english
          })),
          createdAt: new Date().toISOString()
        }
        onAddDeck(deck)
        added++
      }
    })
    
    if (added > 0) {
      setMessage(`✅ Added ${added} chapter(s) to your decks`)
    } else {
      setMessage('⚠️ All chapters already in your collection')
    }
    setTimeout(() => setMessage(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={selectedBook ? () => setSelectedBook(null) : onBack}
        className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {selectedBook ? 'Back to Library' : 'Back to Home'}
      </button>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-center ${
          message.startsWith('✅') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading library...</p>
        </div>
      ) : !selectedBook ? (
        <div>
          <h2 className="text-2xl font-bold text-emerald-800 mb-6">📚 Public Flashcard Library</h2>
          <p className="text-gray-600 mb-8">Pre-built vocabulary decks you can add to your collection instantly.</p>
          
          <div className="grid gap-6">
            {books.map(book => (
              <div 
                key={book.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => loadBook(book.id)}
              >
                <h3 className="text-xl font-bold text-emerald-800 mb-2">{book.name}</h3>
                <p className="text-gray-600 mb-4">{book.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {book.chapters} Chapters
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    ~{book.totalCards} Cards
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-emerald-800">
              {books.find(b => b.id === selectedBook)?.name}
            </h2>
            {chapters.length > 0 && (
              <button
                onClick={addAllChapters}
                className="btn-islamic text-sm"
              >
                Add All Chapters
              </button>
            )}
          </div>

          {loadingChapters ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chapters...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {chapters.map(chapter => {
                const isAdded = existingDeckIds.includes(chapter.id)
                return (
                  <div
                    key={chapter.id}
                    className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-emerald-800">{chapter.name}</h3>
                      <p className="text-sm text-gray-500">{chapter.cards.length} cards</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {chapter.cards.slice(0, 4).map(card => (
                          <span key={card.id} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                            <span className="arabic">{card.arabic.split(' ')[0]}</span> • {card.english}
                          </span>
                        ))}
                        {chapter.cards.length > 4 && (
                          <span className="text-xs text-gray-400">+{chapter.cards.length - 4} more</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addChapterToDeck(chapter)}
                      disabled={isAdded}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isAdded
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isAdded ? 'Added ✓' : 'Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
