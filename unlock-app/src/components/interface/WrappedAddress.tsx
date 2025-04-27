import React, { useCallback } from 'react'
import { Address } from '@unlock-protocol/ui'
import { ToastHelper } from '@unlock-protocol/ui'
import networks from '@unlock-protocol/networks'
import { useResolvedName } from '~/hooks/useNameResolver'

/**
 * @typedef {Object} WrappedAddressProps
 * @property {string | `0x${string}`} address - The Ethereum address to display.
 * @property {boolean} [showExternalLink] - Whether to show an external link to the address.
 * @property {boolean} [showCopyIcon] - Whether to show a copy icon.
 * @property {boolean} [showResolvedName] - Whether to show the resolved name instead of minified address. If false, will always show minified address.
 * @property {string} [className] - Additional CSS classes.
 * @property {boolean} [minified] - Whether to show a minified version of the address.
 * @property {'ens' | 'multiple'} [preferredResolver] - The preferred name resolution method.
 * @property {string} [externalLinkUrl] - Custom external link URL.
 * @property {string} [resolvedName] - The resolved name (ENS or Base) for the address.
 * @property {boolean} [skipResolution] - Whether to skip name resolution. When true, will not attempt to resolve name unless resolvedName is provided.
 * @property {string} [addressType] - The type of address being displayed (e.g., 'lock', 'wallet', 'contract', 'default').
 * @property {number} [network] - The network ID for generating the explorer URL.
 */
interface WrappedAddressProps {
  address: string | `0x${string}`
  showExternalLink?: boolean
  showCopyIcon?: boolean
  showResolvedName?: boolean
  className?: string
  minified?: boolean
  preferredResolver?: 'ens' | 'base' | 'multiple'
  externalLinkUrl?: string
  addressType?: 'lock' | 'wallet' | 'contract' | 'default'
  network?: number
  resolvedName?: string
  skipResolution?: boolean
}

/**
 * Ensures the address always starts with '0x'.
 * @param {string | `0x${string}`} address - The input address.
 * @returns {`0x${string}`} The normalized address.
 */
const normalizeAddress = (address: string | `0x${string}`): `0x${string}` => {
  return address.startsWith('0x') ? (address as `0x${string}`) : `0x${address}`
}

/**
 * A component that wraps an Ethereum address with additional functionality.
 * @param {WrappedAddressProps} props - The component props.
 * @returns {JSX.Element} The rendered address component.
 */
export const WrappedAddress: React.FC<WrappedAddressProps> = ({
  address,
  resolvedName: providedResolvedName,
  preferredResolver = 'multiple',
  showCopyIcon = true,
  showExternalLink = true,
  externalLinkUrl,
  addressType = 'default',
  skipResolution = false,
  network,
  showResolvedName = true,
  ...props
}) => {
  // Normalize the address to always start with 0x
  const normalizedAddress = normalizeAddress(address)

  // To prevent redundant calls:
  // 1. If a resolvedName is provided, we shouldn't query at all
  // 2. If skipResolution is true, we also shouldn't query
  const shouldQuery = !providedResolvedName && !skipResolution

  // Use the React Query hook only when necessary
  const { resolvedName: queryResolvedName } = useResolvedName(
    shouldQuery ? normalizedAddress : undefined,
    preferredResolver,
    !shouldQuery // explicitly skip if we shouldn't query
  )

  // Use provided name if available, otherwise use the resolved name from the query
  const effectiveResolvedName = providedResolvedName || queryResolvedName

  /**
   * Handles the copy action for the address.
   */
  const handleCopy = useCallback(() => {
    let message: string
    switch (addressType) {
      case 'lock':
        message = 'Lock address copied to clipboard'
        break
      case 'wallet':
        message = 'Wallet address copied to clipboard'
        break
      case 'contract':
        message = 'Contract address copied to clipboard'
        break
      default:
        message = 'Address copied to clipboard'
    }
    ToastHelper.success(message)
  }, [addressType])

  /**
   * Generates the explorer URL based on the provided network.
   */
  const getExplorerUrl = useCallback(() => {
    if (network && networks[network]) {
      const { explorer } = networks[network]
      return explorer?.urls?.address(normalizedAddress) || undefined
    }
    return undefined
  }, [network, normalizedAddress])

  return (
    <Address
      address={normalizedAddress}
      resolvedName={effectiveResolvedName}
      onCopied={handleCopy}
      showCopyIcon={showCopyIcon}
      showExternalLink={showExternalLink}
      showResolvedName={showResolvedName}
      externalLinkUrl={externalLinkUrl || getExplorerUrl()}
      {...props}
    />
  )
}
