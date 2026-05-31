import Link from 'next/link'

interface GuideCalloutProps {
  title: string
  description: string
  href: string
  linkLabel: string
}

export const GuideCallout = ({
  title,
  description,
  href,
  linkLabel,
}: GuideCalloutProps) => {
  return (
    <div className="grid gap-2 p-4 text-sm border border-gray-200 rounded-lg bg-gray-50 text-brand-dark">
      <p className="font-semibold">{title}</p>
      <p>{description}</p>
      <Link
        className="font-medium underline text-brand-ui-primary"
        href={href}
        target="_blank"
        rel="noreferrer"
      >
        {linkLabel}
      </Link>
    </div>
  )
}
