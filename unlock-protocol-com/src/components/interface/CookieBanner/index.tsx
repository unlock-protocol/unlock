import { Button } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import useLocalStorage from 'use-local-storage'

export function CookieBanner() {
  const [enableAnalytics, setEnableAnalytics] = useLocalStorage<boolean | null>(
    'enable_analytics',
    null
  )
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // wait for 5 seconds to show up cookie banner if needed
    const timeout = setTimeout(() => {
      setMounted(true)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [])

  if (enableAnalytics !== null || !mounted) {
    return null
  }

  return (
    <div className="fixed z-20 flex flex-col items-end justify-between gap-4 px-6 py-4 left-6 lg:left-auto sm:items-center sm:flex-row glass-pane right-6 rounded-3xl bottom-6">
      <p className="text-brand-gray">
        We use third-party cookies in order to personalize your site experience.
      </p>
      <div className="flex gap-2">
        <Button
          size="small"
          onClick={(event) => {
            event.preventDefault()
            setEnableAnalytics(false)
          }}
          variant="secondary"
        >
          Disagree
        </Button>
        <Button
          size="small"
          onClick={(event) => {
            event.preventDefault()
            setEnableAnalytics(true)
          }}
          variant="primary"
        >
          Agree
        </Button>
      </div>
    </div>
  )
}
