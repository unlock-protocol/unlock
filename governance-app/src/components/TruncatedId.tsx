// ABOUTME: Client component that displays a truncated ID with a copy-to-clipboard button.
// Shows first and last N characters separated by "…" and copies the full value on click.
'use client'

import { useState } from 'react'
import { MdContentCopy as CopyIcon, MdCheck as CheckIcon } from 'react-icons/md'

type TruncatedIdProps = {
  id: string
  keep?: number
}

export function TruncatedId({ id, keep = 4 }: TruncatedIdProps) {
  const [copied, setCopied] = useState(false)

  const display =
    id.length <= keep * 2 + 1 ? id : `${id.slice(0, keep)}…${id.slice(-keep)}`

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono">{display}</span>
      <button
        aria-label="Copy full proposal ID"
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
