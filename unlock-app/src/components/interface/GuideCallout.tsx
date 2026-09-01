import Link from 'next/link'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'

interface GuideCalloutProps {
  title?: string
  description: string
  href: string
  linkLabel: string
}

export const GuideCallout = ({
  title = 'Need help?',
  description,
  href,
  linkLabel,
}: GuideCalloutProps) => {
  return (
    <div className="rounded-lg border border-brand-ui-primary bg-[#FFF7E8] p-4 text-sm text-brand-dark">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">
        {description}{' '}
        <Link
          className="inline-flex items-center font-semibold text-brand-ui-primary hover:underline"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {linkLabel}
          <ExternalLinkIcon className="ml-1" />
        </Link>
      </p>
    </div>
  )
}
