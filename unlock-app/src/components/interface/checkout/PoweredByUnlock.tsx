import { Images } from '@unlock-protocol/ui'

export function PoweredByUnlock() {
  return (
    <div className="flex justify-center py-4">
      <a
        className="inline-flex items-center gap-1 text-sm font-medium"
        href="https://unlock-protocol.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by{' '}
        <Images.UnlockWordMark className="fill-black" style={{ height: 14 }} />
      </a>
    </div>
  )
}
