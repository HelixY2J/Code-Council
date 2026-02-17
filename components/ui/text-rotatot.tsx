'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

type TextRotatorProps = {
  words: string[]
  className?: string
  typingDelayMs?: number
  deletingDelayMs?: number
  holdAtFullMs?: number
  holdAtEmptyMs?: number
  showCursor?: boolean
}

type Phase = 'typing' | 'deleting' | 'pause-full' | 'pause-empty'

export function TextRotator({
  words,
  className,
  typingDelayMs = 120,
  deletingDelayMs = 60,
  holdAtFullMs = 1200,
  holdAtEmptyMs = 400,
  showCursor = true,
}: TextRotatorProps) {
  const safeWords = useMemo(() => (words && words.length > 0 ? words.filter(Boolean) : ['']), [words])
  const [wordIndex, setWordIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')
  const safeIndex = safeWords.length > 0 ? Math.min(wordIndex, safeWords.length - 1) : 0

  // Reset wordIndex when words array shrinks and current index is out of bounds
  useEffect(() => {
    if (wordIndex >= safeWords.length && safeWords.length > 0) {
      setWordIndex(0)
      setSubIndex(0)
      setPhase('typing')
    }
  }, [safeWords.length, wordIndex])

  useEffect(() => {
    const currentWord = safeWords[safeIndex] ?? ''

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (phase === 'typing') {
      if (subIndex < currentWord.length) {
        timeoutId = setTimeout(() => setSubIndex((s) => s + 1), typingDelayMs)
      } else {
        timeoutId = setTimeout(() => setPhase('pause-full'), holdAtFullMs)
      }
    } else if (phase === 'deleting') {
      if (subIndex > 0) {
        timeoutId = setTimeout(() => setSubIndex((s) => s - 1), deletingDelayMs)
      } else {
        timeoutId = setTimeout(() => setPhase('pause-empty'), holdAtEmptyMs)
      }
    } else if (phase === 'pause-full') {
      timeoutId = setTimeout(() => setPhase('deleting'), deletingDelayMs)
    } else if (phase === 'pause-empty') {
      timeoutId = setTimeout(() => {
        setWordIndex((i) => (i + 1) % Math.max(1, safeWords.length))
        setPhase('typing')
      }, typingDelayMs)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [safeWords, safeIndex, wordIndex, subIndex, phase, typingDelayMs, deletingDelayMs, holdAtFullMs, holdAtEmptyMs])

  const text = (safeWords[safeIndex] ?? '').slice(0, subIndex)

  return (
    <span className={className} aria-live="polite" aria-atomic="true">
      {text}
      {showCursor && (
        <motion.span
          aria-hidden="true"
          className="ml-1 inline-block h-[1em] w-px align-[-0.15em] bg-current"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </span>
  )
}

