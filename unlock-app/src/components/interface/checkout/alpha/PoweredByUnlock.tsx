import UnlockAssets from '@unlock-protocol/unlock-assets'

const { SvgComponents } = UnlockAssets

export function PoweredByUnlock() {
  return (
    <div className="flex justify-center py-4">
      <a
        className="inline-flex text-sm items-center gap-1 font-medium"
        href="https://unlock-protocol.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by <SvgComponents.UnlockWordMark height={14} />
      </a>
    </div>
  )
}
