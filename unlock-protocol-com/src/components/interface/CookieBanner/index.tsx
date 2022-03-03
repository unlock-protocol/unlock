import { Button } from '@unlock-protocol/ui'
import useLocalStorage from 'use-local-storage'

export function CookieBanner() {
  const [enableAnalytics, setEnableAnalytics] = useLocalStorage(
    'enable_analytics',
    false
  )
  if (enableAnalytics !== null) {
    return <> </>
  }
  return (
    <div className="top-0 left-0 right-0 flex flex-col justify-between p-4 border gap-y-2 sm:items-center sm:flex-row bottom">
      <p className="text-brand-gray">
        Allow us to collect analytics for the purpose of improving the site.
      </p>
      <div className="flex justify-end gap-4">
        <Button
          onClick={(event) => {
            event.preventDefault()
            setEnableAnalytics(false)
          }}
          variant="secondary"
        >
          Disagree
        </Button>
        <Button
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
