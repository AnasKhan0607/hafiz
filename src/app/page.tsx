'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import FlashcardDeck from '@/components/FlashcardDeck'
import QuizMode from '@/components/QuizMode'
import DeckList from '@/components/DeckList'
import Library from '@/components/Library'
import { Deck, FlashCard } from '@/types'

type View = 'home' | 'upload' | 'deck' | 'quiz' | 'library'

export default function Home() {
  const [view, setView] = useState<View>('home')
  const [decks, setDecks] = useState<Deck[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null)
  const [quizDirection, setQuizDirection] = useState<'en-ar' | 'ar-en'>('en-ar')
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  // Load decks from localStorage on mount (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('hafiz-decks')
    if (saved) {
      setDecks(JSON.parse(saved))
    }
    setIsLoaded(true)
  }, [])

  const saveDecks = (newDecks: Deck[]) => {
    setDecks(newDecks)
    localStorage.setItem('hafiz-decks', JSON.stringify(newDecks))
  }

  const handleCardsExtracted = (cards: FlashCard[], lessonName: string) => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: lessonName,
      cards,
      createdAt: new Date().toISOString(),
    }
    saveDecks([...decks, newDeck])
    setCurrentDeck(newDeck)
    setView('deck')
  }

  const handleAddDeck = (deck: Deck) => {
    saveDecks([...decks, deck])
  }

  const handleDeleteDeck = (deckId: string) => {
    saveDecks(decks.filter(d => d.id !== deckId))
  }

  const handleStartQuiz = (deck: Deck, direction: 'en-ar' | 'ar-en') => {
    setCurrentDeck(deck)
    setQuizDirection(direction)
    setView('quiz')
  }

  // Export all decks as JSON
  const handleExportAll = () => {
    const data = JSON.stringify(decks, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hafiz-decks-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export single deck as JSON
  const handleExportDeck = (deck: Deck) => {
    const data = JSON.stringify(deck, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hafiz-${deck.name.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import decks from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        
        // Check if it's a single deck or array of decks
        if (Array.isArray(data)) {
          // Multiple decks
          const validDecks = data.filter((d: Deck) => d.name && d.cards && Array.isArray(d.cards))
          if (validDecks.length === 0) {
            setImportMessage('❌ No valid decks found in file')
            return
          }
          // Add new IDs to avoid conflicts
          const newDecks = validDecks.map((d: Deck) => ({
            ...d,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }))
          saveDecks([...decks, ...newDecks])
          setImportMessage(`✅ Imported ${newDecks.length} deck(s)`)
        } else if (data.name && data.cards) {
          // Single deck
          const newDeck = {
            ...data,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }
          saveDecks([...decks, newDeck])
          setImportMessage(`✅ Imported "${data.name}"`)
        } else {
          setImportMessage('❌ Invalid file format')
        }
      } catch (err) {
        setImportMessage('❌ Failed to parse file')
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setImportMessage(null), 3000)
    }
    reader.readAsText(file)
    
    // Reset input
    if (importInputRef.current) {
      importInputRef.current.value = ''
    }
  }

  return (
    <main className="min-h-screen">
      <Header onNavigate={setView} currentView={view} />
      
      <div className="container mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-emerald-800 mb-4">
                <span className="arabic">حافظ</span>
              </h1>
              <p className="text-2xl text-emerald-700 mb-2">Hafiz</p>
              <p className="text-gray-600 text-lg">
                Turn Arabic vocabulary screenshots into interactive flashcards
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setView('upload')}
                className="btn-islamic flex items-center justify-center gap-3 py-5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Vocab
              </button>
              
              <button
                onClick={() => setView('library')}
                className="btn-gold flex items-center justify-center gap-3 py-5"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                📚 Library
              </button>
              
              {decks.length > 0 && (
                <a
                  href="#my-decks"
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold py-5 px-6 rounded-lg transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Decks ({decks.length})
                </a>
              )}
            </div>

            {/* Import/Export Section */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => importInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              
              {decks.length > 0 && (
                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export All
                </button>
              )}
            </div>

            {/* Import Message */}
            {importMessage && (
              <div className={`text-center mb-6 p-3 rounded-lg ${
                importMessage.startsWith('✅') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                {importMessage}
              </div>
            )}

            {/* Deck List Preview */}
            {decks.length > 0 && (
              <div id="my-decks">
              <DeckList 
                decks={decks} 
                onSelect={(deck) => { setCurrentDeck(deck); setView('deck'); }}
                onDelete={handleDeleteDeck}
                onStartQuiz={handleStartQuiz}
                onExport={handleExportDeck}
              />
              </div>
            )}

            {/* Empty State */}
            {decks.length === 0 && (
              <div className="text-center py-12 bg-white/50 rounded-2xl border-2 border-dashed border-emerald-200">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">No flashcard decks yet</h3>
                <p className="text-gray-600 mb-4">Upload vocabulary or browse the library to get started</p>
                <button
                  onClick={() => setView('library')}
                  className="text-emerald-600 hover:text-emerald-800 font-medium underline"
                >
                  Browse Madinah Arabic decks →
                </button>
              </div>
            )}
          </div>
        )}

        {view === 'upload' && (
          <ImageUpload 
            onCardsExtracted={handleCardsExtracted}
            onBack={() => setView('home')}
          />
        )}

        {view === 'library' && (
          <Library
            onAddDeck={handleAddDeck}
            onBack={() => setView('home')}
            existingDeckIds={decks.map(d => d.id)}
          />
        )}

        {view === 'deck' && currentDeck && (
          <FlashcardDeck 
            deck={currentDeck}
            onBack={() => setView('home')}
            onStartQuiz={(direction) => handleStartQuiz(currentDeck, direction)}
          />
        )}

        {view === 'quiz' && currentDeck && (
          <QuizMode 
            deck={currentDeck}
            direction={quizDirection}
            onBack={() => setView('deck')}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-emerald-700">
        <p className="arabic text-2xl mb-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="text-sm text-gray-500">Built with 💚 to help learn the language of the Quran</p>
      </footer>
    </main>
  )
}
