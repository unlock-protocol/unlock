import React, { Fragment, useState } from 'react'
import { OAuthConfig } from '~/unlockTypes'
import { PaywallConfigType } from '@unlock-protocol/core'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useSIWE } from '~/hooks/useSIWE'
import { generateNonce } from 'siwe'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Button } from '@unlock-protocol/ui'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  className: string
  paywallConfig?: PaywallConfigType
  oauthConfig: OAuthConfig
  onClose(params?: Record<string, string>): void
  communication?: ReturnType<typeof useCheckoutCommunication>
}

export function ConfirmConnect({
  className,
  oauthConfig,
  paywallConfig,
  onClose,
  communication,
}: Props) {
  const { siweSign, signature, message } = useSIWE()
  const { account } = useAuthenticate()

  const [isLoading, setIsLoading] = useState(false)

  const onSuccess = (signature: string, message: string) => {
    const code = Buffer.from(
      JSON.stringify({
        d: message,
        s: signature,
      })
    ).toString('base64')
    communication?.emitUserInfo({
      address: account,
      message: message,
      signedMessage: signature,
    })
    onClose({
      code,
      state: oauthConfig.state,
    })
  }

  const onConfirm = async () => {
    if (signature && message) {
      onSuccess(signature, message)
    } else {
      setIsLoading(true)
      const result = await siweSign(
        generateNonce(),
        paywallConfig?.messageToSign || '',
        {
          resources: [new URL('https://' + oauthConfig.clientId).toString()],
        }
      )
      if (result) {
        onSuccess(result.signature, result.message)
      }
      setIsLoading(false)
    }
  }

  return (
    <Fragment>
      <main className={className}>
        <div className="grid gap-6 px-6 ">
          <div className="text-center text-xl my-4">
            Are you sure you want to connect to{' '}
            <span className="text-brand-ui-primary">
              {oauthConfig.clientId.length > 20
                ? oauthConfig.clientId.slice(0, 17) + '...'
                : oauthConfig.clientId}{' '}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <p>If you approve, this website may: </p>
            <ul className="flex flex-col gap-2">
              <li>✅ See your wallet balance and activity</li>
              <li>✅ Identify what memberships you own</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            {' '}
            <p>But it will not be able to: </p>
            <ul className="flex flex-col gap-2">
              <li>❌ move your funds</li>
              <li>❌ transfer your memberships</li>
            </ul>
          </div>
          <div className="flex w-full gap-4 mt-8">
            <Button
              onClick={() =>
                onClose({
                  error: 'access-denied',
                })
              }
              className="w-full"
              variant="secondary"
            >
              Deny
            </Button>
            <Button
              loading={isLoading}
              onClick={() => onConfirm()}
              className="w-full"
            >
              Approve
            </Button>
          </div>
        </div>
      </main>
      <footer className="grid items-center px-6 pt-2 border-t">
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
