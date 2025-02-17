import React, { useCallback } from 'react'
import { Address } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useNameResolver } from '~/hooks/useNameResolver'
import networks from '@unlock-protocol/networks'

/**
 * @typedef {Object} WrappedAddressProps
 * @property {string | `0x${string}`} address - The Ethereum address to display.
 * @property {boolean} [showExternalLink] - Whether to show an external link to the address.
 * @property {boolean} [showCopyIcon] - Whether to show a copy icon.
 * @property {boolean} [showResolvedName] - Whether to show the resolved name (e.g., ENS, Base names).
 * @property {string} [className] - Additional CSS classes.
 * @property {boolean} [minified] - Whether to show a minified version of the address.
 * @property {'ens' | 'multiple'} [preferredResolver] - The preferred name resolution method.
 * @property {string} [externalLinkUrl] - Custom external link URL.
 * @property {string} [resolvedName] - The resolved name (ENS or Base) for the address.
 * @property {boolean} [skipResolution] - Whether to skip name resolution and just show the address.
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
  resolvedName,
  preferredResolver = 'multiple',
  showCopyIcon = true,
  showExternalLink = true,
  externalLinkUrl,
  addressType = 'default',
  skipResolution = false,
  network,
  ...props
}) => {
  // Normalize the address to always start with 0x
  const normalizedAddress = normalizeAddress(address)

  // If resolvedName is provided or skipResolution is true, we should skip the name resolution
  const shouldSkipResolution = Boolean(resolvedName || skipResolution)

  // Fetch names for the address using the name resolver hook
  const { ensName, baseName } = useNameResolver(
    normalizedAddress,
    shouldSkipResolution
  )

  /**
   * Handles the copy action for the address.
   * This function is triggered when the address is copied to the clipboard.
   * It displays a success toast notification with a message that varies based on the type of address.
   */
  const handleCopy = useCallback(() => {
    // Initialize a message variable to hold the success message
    let message: string

    // Determine the appropriate message based on the type of address
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

    // Show a success toast notification with the determined message
    ToastHelper.success(message)
  }, [addressType]) // include addressType to ensure the latest value is used

  /**
   * Resolves names based on the preferred resolver.
   * @returns {string} The resolved name or the original address if not resolved.
   */
  const getResolvedName = useCallback((): string => {
    if (resolvedName) return resolvedName
    if (skipResolution) return address

    if (preferredResolver === 'ens') {
      return ensName || baseName || address
    } else if (preferredResolver === 'base') {
      return baseName || ensName || address
    } else if (preferredResolver === 'multiple') {
      // Prioritize ENS, then Base name, then fall back to address
      return ensName || baseName || address
    }
    return address
  }, [
    preferredResolver,
    ensName,
    baseName,
    address,
    resolvedName,
    skipResolution,
  ])

  /**
   * Generates the explorer URL based on the provided network.
   * This function checks if the network is valid and retrieves the corresponding explorer URL for the normalized address.
   * If the network is not provided or not found, it returns undefined.
   * @returns {string | undefined} The explorer URL for the address or undefined if no valid network is provided.
   */
  const getExplorerUrl = useCallback(() => {
    if (network && networks[network]) {
      const { explorer } = networks[network]
      return explorer?.urls?.address(normalizedAddress) || undefined
    }
    // Return undefined if no network is provided or if it's not found
    return undefined
  }, [network, normalizedAddress])

  return (
    <Address
      address={address}
      resolvedName={getResolvedName()}
      onCopied={handleCopy}
      showCopyIcon={showCopyIcon}
      showExternalLink={showExternalLink}
      externalLinkUrl={getExplorerUrl()}
      {...props}
    />
  )
}
