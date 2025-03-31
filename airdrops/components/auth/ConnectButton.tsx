'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@unlock-protocol/ui'

interface ConnectButtonProps {
  onConnect?: () => void
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export function ConnectButton({
  onConnect,
  disabled,
  children,
  className,
}: ConnectButtonProps) {
  const { ready, authenticated, login } = usePrivy()

  const handleConnect = () => {
    if (ready && !authenticated) {
      login()
      onConnect?.()
    }
  }

  if (authenticated) {
    return null
  }

  return (
    <Button
      disabled={disabled || !ready}
      onClick={handleConnect}
      className={className}
    >
      {children || 'Connect Wallet'}
    </Button>
  )
}
