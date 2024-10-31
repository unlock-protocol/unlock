'use client'

import { ImageBar } from '~/components/interface/locks/Manage/elements/ImageBar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you were looking for could not be found.',
}

export default function NotFound() {
  const pathname = usePathname()
  const wasEventPage = pathname?.match(/\/event\//)

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-4xl font-bold text-center">
        {wasEventPage ? 'Event Page Not Found' : 'Page Not Found'}
      </h1>
      <ImageBar
        description={
          wasEventPage ? (
            <p>
              The event page you were looking for could not be found. Back to{' '}
              <Link href="/event" className="text-brand-ui-primary underline">
                Event By Unlock
              </Link>
            </p>
          ) : (
            'The page you were looking for could not be found.'
          )
        }
        src="/images/illustrations/img-error.svg"
      />
      {!wasEventPage && (
        <p className="text-center">
          Back to{' '}
          <Link href="/" className="text-brand-ui-primary underline">
            Home
          </Link>
        </p>
      )}
    </div>
  )
}
