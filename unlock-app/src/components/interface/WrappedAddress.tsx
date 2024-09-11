import React from 'react'
import { Address } from '@unlock-protocol/ui'
import { useEns } from '~/hooks/useEns'
import { ToastHelper } from '~/components/helpers/toast.helper'
import useClipboard from 'react-use-clipboard'

/**
 * @typedef {Object} WrappedAddressProps
 * @property {string | `0x${string}`} address - The Ethereum address to display.
 * @property {boolean} [showExternalLink] - Whether to show an external link to the address.
 * @property {boolean} [showCopyIcon] - Whether to show a copy icon.
 * @property {boolean} [showResolvedName] - Whether to show the resolved name (e.g., ENS, Base names).
 * @property {string} [className] - Additional CSS classes.
 * @property {boolean} [minified] - Whether to show a minified version of the address.
 * @property {boolean} [showToast] - Whether to show a toast notification on copy.
 * @property {'ens' | 'multiple'} [preferredResolver] - The preferred name resolution method.
 */
interface WrappedAddressProps {
  address: string | `0x${string}`
  showExternalLink?: boolean
  showCopyIcon?: boolean
  showResolvedName?: boolean
  className?: string
  minified?: boolean
  showToast?: boolean
  preferredResolver?: 'ens' | 'multiple'
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
  showToast = true,
  preferredResolver = 'multiple',
  showCopyIcon = true,
  showExternalLink = true,
  ...props
}) => {
  // normalize the address to always start with 0x
  const normalizedAddress = normalizeAddress(address)

  const [isCopied, setCopied] = useClipboard(normalizedAddress)

  // Fetch ENS name for the address
  const ensName = useEns(normalizedAddress)

  // Display a toast notification when the address is copied
  React.useEffect(() => {
    if (isCopied && showToast) {
      ToastHelper.success('Address copied to clipboard')
    }
  }, [isCopied, showToast])

  /**
   * Resolves names based on the preferred resolver.
   * @param {string} addr - The address to resolve.
   * @returns {Promise<string | undefined>} The resolved name or undefined.
   */
  const resolveNames = React.useCallback(
    async (addr: string): Promise<string> => {
      if (preferredResolver === 'ens' || preferredResolver === 'multiple') {
        return ensName !== addr ? ensName : addr
      }
      return addr
    },
    [preferredResolver, ensName]
  )

  /**
   * Wrapper function for resolving multiple names (currently only ENS).
   * This function is designed to be extensible for future name resolution methods.
   * @param {string} address - The address to resolve.
   * @returns {Promise<string | undefined>} The resolved name or undefined.
   */
  const resolveMultipleNames = React.useCallback(
    async (address: string): Promise<string | undefined> => {
      return resolveNames(address)
    },
    [resolveNames]
  )

  return (
    <Address
      address={address}
      useName={resolveMultipleNames}
      onCopied={setCopied}
      showCopyIcon={showCopyIcon}
      showExternalLink={showExternalLink}
      {...props}
    />
  )
}
