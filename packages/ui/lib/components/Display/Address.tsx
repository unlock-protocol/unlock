import React, { useCallback, useEffect } from 'react'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { Placeholder } from '../Placeholder'
import useClipboard from 'react-use-clipboard'
import { minifyAddress } from '~/utils'
import { Button } from '../Button/Button'

// Define the props for the Address component
export interface AddressProps {
  address: string // The Ethereum address to display
  resolvedName?: string // Optional resolved name for the address
  showExternalLink?: boolean // Flag to show external link to Etherscan
  externalLinkUrl?: string // custom external link URL
  showCopyIcon?: boolean // Flag to show copy icon for clipboard functionality
  showResolvedName?: boolean // Flag to show the resolved name if available
  className?: string // Additional CSS classes for styling
  minified?: boolean // Flag to determine if the address should be minified
  useName?: (address: string) => Promise<string | undefined> // Function to resolve name from address
  onCopied?: () => void // Callback function to execute when the address is copied
}

// Functional component to display an Ethereum address with optional features
export const Address: React.FC<AddressProps> = ({
  address,
  resolvedName,
  showExternalLink = false,
  externalLinkUrl,
  showCopyIcon = false,
  showResolvedName = true,
  className = '',
  minified = true,
  useName,
  onCopied,
}) => {
  // manage clipboard copy status
  const [, setCopied] = useClipboard(address, {
    successDuration: 0,
  })
  //state to hold the resolved name, initialized with the resolvedName prop
  const [name, setName] = React.useState<string | undefined>(resolvedName)

  // fetch the name associated with the address if `useName` is provided
  useEffect(() => {
    const fetchName = async () => {
      if (useName) {
        const resolvedName = await useName(address)
        setName(resolvedName)
      }
    }

    fetchName()
  }, [address, useName])

  // trigger the onCopied callback when the address is copied
  const handleCopy = useCallback(() => {
    setCopied()
    if (onCopied) {
      onCopied()
    }
  }, [setCopied, onCopied])

  // Determine the display name based on the props and state
  const displayName =
    showResolvedName && name && name !== address
      ? name // Show the resolved name if available and different from address
      : minified
        ? minifyAddress(address) // Minify the address if the minified flag is true
        : address // Default to showing the full address

  return (
    <div className="flex items-center space-x-2">
      {name === undefined && useName ? (
        // Show a placeholder while the name is being resolved
        <Placeholder.Root inline={true} spaced="sm">
          <Placeholder.Line width="md" size="sm" />
        </Placeholder.Root>
      ) : (
        // Display the resolved name or minified address
        <span className={`${className}`}>{displayName}</span>
      )}
      {showCopyIcon && (
        // Button to copy the address to clipboard
        <Button variant="borderless" onClick={handleCopy} aria-label="copy">
          <CopyIcon size={20} />
        </Button>
      )}
      {showExternalLink && (
        // External link to the custom URL for the address or Etherscan
        <a
          href={externalLinkUrl || `https://etherscan.io/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          <Button variant="borderless" aria-label="external link">
            <ExternalLinkIcon size={20} className="text-brand-ui-primary" />
          </Button>
        </a>
      )}
    </div>
  )
}
