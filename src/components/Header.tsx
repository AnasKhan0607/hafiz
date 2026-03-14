'use client'

interface HeaderProps {
  onNavigate: (view: 'home' | 'upload' | 'deck' | 'quiz' | 'library') => void
  currentView: string
}

export default function Header({ onNavigate, currentView }: HeaderProps) {
  return (
    <header className="bg-emerald-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
              <span className="arabic text-emerald-900 font-bold">ح</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Hafiz</h1>
              <p className="text-emerald-200 text-xs">Arabic Flashcards</p>
            </div>
          </button>
          
          <nav className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                currentView === 'home' 
                  ? 'bg-emerald-700' 
                  : 'hover:bg-emerald-700/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('library')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                currentView === 'library' 
                  ? 'bg-emerald-700' 
                  : 'hover:bg-emerald-700/50'
              }`}
            >
              📚 Library
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                currentView === 'upload' 
                  ? 'bg-emerald-700' 
                  : 'hover:bg-emerald-700/50'
              }`}
            >
              Upload
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
