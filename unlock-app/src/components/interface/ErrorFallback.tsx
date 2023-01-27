import { Button } from '@unlock-protocol/ui'
import useClipboard from 'react-use-clipboard'
import { FiCopy as CopyIcon } from 'react-icons/fi'
import {
  SiDiscord as DiscordIcon,
  SiGithub as GithubIcon,
} from 'react-icons/si'

interface Props {
  error: Error
  componentStack: string | null
  eventId: string | null
  resetError(): void
}

export function ErrorFallback(props: Props) {
  const { error, componentStack, eventId } = props
  const [isCopied, copy] = useClipboard(eventId ?? '', {
    successDuration: 1000,
  })
  return (
    <div className="max-w-3xl px-6 pt-12 pb-6 mx-auto">
      <header>
        <h1 className="text-xl font-bold"> Something went wrong...</h1>
        <p className="text-gray-600">
          To report this, please open an issue with the event ID and details on
          github or tell us about it on discord.
        </p>
      </header>
      <main className="py-6 space-y-6">
        <div>
          <div className="text-lg font-bold"> Error </div>
          <div>{error.message?.toString()}</div>
        </div>
        <div>
          <div className="inline-flex gap-2">
            <div className="text-lg font-bold"> Event ID</div>
            <button
              onClick={(event) => {
                event.preventDefault()
                copy()
              }}
              className="inline-flex items-center px-2 py-0.5 text-sm font-medium rounded-lg gap-2 border"
            >
              {isCopied ? 'Copied' : 'Copy'}
              <CopyIcon />
            </button>
          </div>
          <div>
            <pre>{eventId}</pre>
          </div>
        </div>
      </main>
      <div className="flex flex-col gap-2 md:flex-row">
        <Button
          as="a"
          href={new URL('/locks', window.location.href).toString()}
          size="small"
        >
          Go Back
        </Button>
        <Button
          size="small"
          as="a"
          iconLeft={<DiscordIcon key="discord" />}
          href="https://discord.com/invite/Ah6ZEJyTDp"
        >
          Join Discord
        </Button>
        <Button
          size="small"
          as="a"
          iconLeft={<GithubIcon key="github" />}
          href="https://github.com/unlock-protocol/unlock/issues/new?template=bug_report.md"
        >
          Report it on github
        </Button>
      </div>
      <details className="py-6 whitespace-pre-wrap cursor-pointer">
        <div>{componentStack?.toString()}</div>
      </details>
    </div>
  )
}
