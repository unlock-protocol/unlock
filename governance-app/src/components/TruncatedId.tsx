// ABOUTME: Client component that displays a truncated ID with a copy-to-clipboard button.
// Shows first and last N characters separated by "…" and copies the full value on click.
'use client'

import { useEffect, useRef, useState } from 'react'
import { MdContentCopy as CopyIcon, MdCheck as CheckIcon } from 'react-icons/md'

type TruncatedIdProps = {
  id: string
  keep?: number
  label?: string
}

export function TruncatedId({
  id,
  keep = 4,
  label = 'Copy full ID',
}: TruncatedIdProps) {
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const display =
    id.length <= keep * 2 + 1 ? id : `${id.slice(0, keep)}…${id.slice(-keep)}`

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (non-HTTPS or permission denied) — fail silently.
    }
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono">{display}</span>
      <button
        aria-label={label}
        className="text-brand-ui-primary/40 transition-colors hover:text-brand-ui-primary"
        onClick={handleCopy}
        type="button"
      >
        {copied ? (
          <CheckIcon className="text-green-500" size={14} />
        ) : (
          <CopyIcon size={14} />
        )}
      </button>
    </span>
  )
}
