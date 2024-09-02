import React, { useEffect } from 'react'
import {
  FiCopy as CopyIcon,
  FiExternalLink as ExternalLinkIcon,
} from 'react-icons/fi'
import useEns from '../../../../../unlock-app/src/hooks/useEns'
import { Placeholder } from '../Placeholder'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '../../../../../unlock-app/src/components/helpers/toast.helper'
import { minifyAddress } from '~/utils'

export interface AddressProps {
  address: string
  showExternalLink?: boolean
  showCopyIcon?: boolean
  showENSName?: boolean
  className?: string
  minified?: boolean
}

export const Address: React.FC<AddressProps> = ({
  address,
  showExternalLink = false,
  showCopyIcon = false,
  showENSName = true,
  className = '',
  minified = true,
}) => {
  const resolvedName = useEns(address)
  const displayName =
    showENSName && resolvedName !== address
      ? resolvedName
      : minified
        ? minifyAddress(address)
        : address
  const [isCopied, setCopy] = useClipboard(address)

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success('Address copied')
  }, [isCopied])

  return (
    <div className="flex items-center space-x-2">
      {resolvedName === undefined ? (
        <Placeholder.Root inline={true} spaced="sm">
          <Placeholder.Line width="md" size="sm" />
        </Placeholder.Root>
      ) : (
        <span
          className={`${className} ${resolvedName === address ? 'font-mono' : ''}`}
        >
          {displayName}
        </span>
      )}
      {showExternalLink && (
        <a
          href={`https://etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          <ExternalLinkIcon size={20} className="text-brand-ui-primary" />
        </a>
      )}
      {showCopyIcon && (
        <button onClick={() => setCopy()}>
          <CopyIcon />
        </button>
      )}
    </div>
  )
}
