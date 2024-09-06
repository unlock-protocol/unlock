import React, { useCallback } from 'react'
import { Address } from '@unlock-protocol/ui'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useNameResolver } from '~/hooks/useNameResolver'

/**
 * @typedef {Object} WrappedAddressProps
 * @property {string | `0x${string}`} address - The Ethereum address to display.
 * @property {boolean} [showExternalLink] - Whether to show an external link to the address.
 * @property {boolean} [showCopyIcon] - Whether to show a copy icon.
 * @property {boolean} [showResolvedName] - Whether to show the resolved name (e.g., ENS, Base names).
 * @property {string} [className] - Additional CSS classes.
 * @property {boolean} [minified] - Whether to show a minified version of the address.
 * @property {'ens' | 'multiple'} [preferredResolver] - The preferred name resolution method.
 */
interface WrappedAddressProps {
  address: string | `0x${string}`
  showExternalLink?: boolean
  showCopyIcon?: boolean
  showResolvedName?: boolean
  className?: string
  minified?: boolean
  preferredResolver?: 'ens' | 'base' | 'multiple'
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
 */
export const WrappedAddress: React.FC<WrappedAddressProps> = ({
  address,
  preferredResolver = 'multiple',
  showCopyIcon = true,
  showExternalLink = true,
  ...props
}) => {
  // normalize the address to always start with 0x
  const normalizedAddress = normalizeAddress(address)

  // Fetch names for the address
  const { ensName, baseName } = useNameResolver(normalizedAddress)

  // Display a toast when the address is copied
  const handleCopy = useCallback(() => {
    ToastHelper.success('Address copied to clipboard')
  }, [])

  /**
   * Resolves names based on the preferred resolver.
   * @param {string} addr - The address to resolve.
   * @returns {Promise<string | undefined>} The resolved name or undefined.
   */
  const resolveNames = useCallback(
    async (addr: string): Promise<string> => {
      if (preferredResolver === 'ens') {
        return ensName || baseName || addr
      } else if (preferredResolver === 'base') {
        return baseName || ensName || addr
      } else if (preferredResolver === 'multiple') {
        // Prioritize ENS, then Base name, then fall back to address
        return ensName || baseName || addr
      }
      return addr
    },
    [preferredResolver, ensName, baseName]
  )

  /**
   * Wrapper function for resolving multiple names (currently only ENS and Base names ).
   * This function is designed to be extensible for future name resolution methods.
   * @param {string} address - The address to resolve.
   * @returns {Promise<string | undefined>} The resolved name or undefined.
   */
  const resolveMultipleNames = useCallback(
    async (address: string): Promise<string | undefined> => {
      return resolveNames(address)
    },
    [resolveNames]
  )

  return (
    <Address
      address={address}
      useName={resolveMultipleNames}
      onCopied={handleCopy}
      showCopyIcon={showCopyIcon}
      showExternalLink={showExternalLink}
      {...props}
    />
  )
}
