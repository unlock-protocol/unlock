'use client'

import Link from 'next/link'

interface GuideCalloutProps {
  description: string
  href: string
  linkLabel: string
  className?: string
}

export const GuideCallout = ({
  description,
  href,
  linkLabel,
  className = '',
}: GuideCalloutProps) => {
  return (
    <div
      className={`rounded-lg border border-brand-ui-primary bg-brand-primary p-4 text-sm text-brand-dark ${className}`}
    >
      <span className="font-semibold">Need help?</span> {description}{' '}
      <Link
        className="font-semibold underline text-brand-ui-primary"
        href={href}
        target="_blank"
      >
        {linkLabel}
      </Link>
    </div>
  )
}
