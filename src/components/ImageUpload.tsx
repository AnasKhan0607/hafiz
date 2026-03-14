'use client'

import { useState, useRef } from 'react'
import { FlashCard } from '@/types'

// Netlify Functions API URL
const API_URL = 'https://hafiz-anas.netlify.app'

interface ImageUploadProps {
  onCardsExtracted: (cards: FlashCard[], lessonName: string) => void
  onBack: () => void
}

export default function ImageUpload({ onCardsExtracted, onBack }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null)
  const [lessonName, setLessonName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const convertPdfToImage = async (file: File): Promise<string> => {
    setLoadingMessage('Loading PDF...')
    
    // Dynamically import pdf.js
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    setLoadingMessage(`Processing page 1 of ${pdf.numPages}...`)
    
    // Get first page (usually has vocab tables)
    const page = await pdf.getPage(1)
    const scale = 2 // Higher quality
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise
    
    return canvas.toDataURL('image/png')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Please use a file under 20MB.')
      return
    }

    setError(null)
    setLoading(true)
    setLoadingMessage('Processing file...')

    try {
      if (file.type === 'application/pdf') {
        setFileType('pdf')
        const imageData = await convertPdfToImage(file)
        setImage(imageData)
      } else if (file.type.startsWith('image/')) {
        setFileType('image')
        const reader = new FileReader()
        reader.onloadend = () => {
          setImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setError('Please upload an image (PNG, JPG) or PDF file.')
        return
      }
    } catch (err) {
      setError('Failed to process file. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
  }

  const extractVocabulary = async () => {
    if (!image || !lessonName.trim()) {
      setError('Please upload a file and enter a lesson name')
      return
    }

    setLoading(true)
    setLoadingMessage('Extracting vocabulary with AI...')
    setError(null)

    try {
      const response = await fetch(`${API_URL}/.netlify/functions/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to process image')
      }

      const data = await response.json()
      
      if (!data.vocabulary || data.vocabulary.length === 0) {
        throw new Error('No vocabulary found in file')
      }

      const cards: FlashCard[] = data.vocabulary.map((item: { arabic: string; english: string }, index: number) => ({
        id: `${Date.now()}-${index}`,
        arabic: item.arabic,
        english: item.english,
      }))

      onCardsExtracted(cards, lessonName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract vocabulary')
    } finally {
      setLoading(false)
      setLoadingMessage('')
    }
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
        Back to Home
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">
          Upload Vocabulary
        </h2>

        {/* Lesson Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lesson/Chapter Name
          </label>
          <input
            type="text"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            placeholder="e.g., Chapter 3 & 4 Vocabulary"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vocabulary File
          </label>
          <div
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              image ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'
            } ${loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {loading && !image ? (
              <div>
                <svg className="animate-spin h-12 w-12 mx-auto text-emerald-600 mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-emerald-600">{loadingMessage}</p>
              </div>
            ) : image ? (
              <div>
                <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg mb-4" />
                <p className="text-emerald-600">
                  {fileType === 'pdf' ? '📄 PDF loaded' : '🖼️ Image loaded'} — Click to change
                </p>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">Click to upload</p>
                <p className="text-gray-400 text-sm mt-1">PNG, JPG, or PDF up to 20MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={extractVocabulary}
          disabled={loading || !image || !lessonName.trim()}
          className="w-full btn-islamic disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && image ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {loadingMessage || 'Extracting vocabulary...'}
            </span>
          ) : (
            'Extract Flashcards'
          )}
        </button>
      </div>
    </div>
  )
}
