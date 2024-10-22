import { CheckoutService } from './checkoutMachine'
import { Button } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useSelector } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import Disconnect from './Disconnect'
import { useProvider } from '~/hooks/useProvider'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  checkoutService: CheckoutService
  communication?: ReturnType<typeof useCheckoutCommunication>
}

export function MessageToSign({ checkoutService, communication }: Props) {
  const { messageToSign } = useSelector(
    checkoutService,
    (state) => state.context.paywallConfig
  )
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()
  const [isSigning, setIsSigning] = useState(false)

  const onSign = async () => {
    setIsSigning(true)
    try {
      const walletService = await getWalletService()

      const signature = await walletService.signMessage(
        messageToSign,
        'personal_sign'
      )
      setIsSigning(false)
      checkoutService.send({
        type: 'SIGN_MESSAGE',
        signature,
        address: account!,
      })
      communication?.emitUserInfo({
        address: account,
        message: messageToSign,
        signedMessage: signature,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
      setIsSigning(false)
    }
  }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        <pre className="whitespace-pre-wrap text-brand-gray">
          {messageToSign}
        </pre>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Button
          disabled={!account || isSigning}
          loading={isSigning}
          onClick={onSign}
          className="w-full"
        >
          Sign the message
        </Button>
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
