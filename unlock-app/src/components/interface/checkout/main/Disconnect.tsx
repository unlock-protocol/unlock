import { Button, Tooltip } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useSIWE } from '~/hooks/useSIWE'
import { addressMinify } from '~/utils/strings'
import { CheckoutService } from './checkoutMachine'
import { useSelector } from '@xstate/react'

interface DisconnectProps {
  service: CheckoutService
}

const Disconnect = ({ service }: DisconnectProps) => {
  const state = useSelector(service, (state) => state)
  const { account, isUnlockAccount, deAuthenticate, email } = useAuth()
  const { signOut } = useSIWE()

  const [isDisconnecting, setIsDisconnecting] = useState(false)

  let userText: string
  let signOutText: string

  if (isUnlockAccount && email) {
    userText = `User: ${email}`
    signOutText = 'Sign out'
  } else {
    userText = `Wallet: ${addressMinify(account!)}`
    signOutText = 'Disconnect'
  }

  const onDisconnect = async () => {
    setIsDisconnecting(true)
    await signOut()
    await deAuthenticate()
    service.send({ type: 'DISCONNECT' })
    setIsDisconnecting(false)
  }

  if (!account) {
    return null
  }

  return (
    <div className="flex items-center justify-between text-sm mt-2">
      <p>{userText}</p>
      <Tooltip
        side="top"
        tip={`${
          isUnlockAccount ? 'Signing out' : 'Disconnecting'
        } will reset the checkout`}
      >
        <Button
          variant="borderless"
          size="small"
          loading={isDisconnecting}
          onClick={(event) => {
            event.preventDefault()
            state.can({ type: 'DISCONNECT' }) ? onDisconnect() : undefined
          }}
          type="button"
        >
          ⤫ {signOutText}
        </Button>
      </Tooltip>
    </div>
  )
}

export default Disconnect
