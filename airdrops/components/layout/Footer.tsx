import Link from 'next/link'

export default function Footer() {
  return (
    <div className="flex flex-col w-full gap-6 py-4 border-t border-gray-400 md:gap-0 md:items-center md:justify-between md:flex-row">
      <span className="text-xs text-brand-dark">
        &copy; Unlock Labs, {new Date().getFullYear()}
      </span>
      <div className="flex gap-8">
        <Link
          href="https://unlock-protocol.com/privacy"
          className="text-xs text-brand-dark"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </Link>

        <Link
          href="https://unlock-protocol.com/terms"
          className="text-xs text-brand-dark"
          target="_blank"
          rel="noopener noreferrer"
        >
          Term of Service
        </Link>
      </div>
    </div>
  )
}
