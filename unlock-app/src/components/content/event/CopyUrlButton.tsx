import { Tooltip } from '@unlock-protocol/ui'
import { BiShareAlt } from 'react-icons/bi'
import { ToastHelper } from '~/components/helpers/toast.helper'

import useClipboard from 'react-use-clipboard'

interface CopyUrlButtonProps {
  eventUrl: string
}

export const CopyUrlButton = ({ eventUrl }: CopyUrlButtonProps) => {
  const [_, setCopied] = useClipboard(eventUrl, {
    successDuration: 1000,
  })

  return (
    <Tooltip
      delay={0}
      label="Copy URL to share"
      tip="Copy URL to share"
      side="bottom"
    >
      <button
        onClick={(event) => {
          event.preventDefault()
          setCopied()
          ToastHelper.success('Copied!')
        }}
        className="w-12 h-12 flex justify-center items-center"
      >
        <BiShareAlt className="w-6 h-6" />
      </button>
    </Tooltip>
  )
}

export default CopyUrlButton
