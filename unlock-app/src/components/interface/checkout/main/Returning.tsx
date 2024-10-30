import { Button, Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { CheckoutService } from './checkoutMachine'
import unlockedAnimation from '~/animations/unlocked.json'
import { useConfig } from '~/utils/withConfig'
import { Stepper } from '../Stepper'
import { useSelector } from '@xstate/react'
import { Fragment, useState, lazy, Suspense } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { ReturningButton } from '../ReturningButton'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { useGetTokenIdForOwner } from '~/hooks/useGetTokenIdForOwner'
import { shouldSkip } from './utils'
import { AddToWallet } from '../../keychain/AddToWallet'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useProvider } from '~/hooks/useProvider'

const Lottie = lazy(() => import('lottie-react'))

interface Props {
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
  communication?: ReturnType<typeof useCheckoutCommunication>
}

export function Returning({ checkoutService, onClose, communication }: Props) {
  const config = useConfig()
  const { paywallConfig, lock, messageToSign } = useSelector(
    checkoutService,
    (state) => state.context
  )
  const { account } = useAuthenticate()
  const { getWalletService } = useProvider()
  const [signedMessage, setSignedMessage] = useState(messageToSign)
  const [hasMessageToSign, setHasMessageToSign] = useState(
    !signedMessage && paywallConfig.messageToSign
  )
  const [isSigningMessage, setIsSigningMessage] = useState(false)

  const onSign = async () => {
    try {
      setIsSigningMessage(true)
      const walletService = await getWalletService()

      const signature = await walletService.signMessage(
        paywallConfig.messageToSign!,
        'personal_sign'
      )
      setIsSigningMessage(false)
      setSignedMessage({ address: account!, signature })
      checkoutService.send({
        type: 'SIGN_MESSAGE',
        signature,
        address: account!,
      })
      setHasMessageToSign(false)
      communication?.emitUserInfo({
        address: account,
        message: paywallConfig.messageToSign,
        signedMessage: signature,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
      setIsSigningMessage(false)
    }
  }

  const { data: tokenId } = useGetTokenIdForOwner(
    { account: account!, lockAddress: lock!.address, network: lock!.network },
    {
      enabled: !!(account && lock),
    }
  )

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <div className="flex flex-col items-center justify-center h-full gap-1">
            <Suspense fallback={<div className="w-28 sm:w-36 h-28 sm:h-36" />}>
              <Lottie
                className={'w-28 sm:w-36 h-28 sm:h-36'}
                animationData={unlockedAnimation}
              />
            </Suspense>
            <p className="text-lg font-bold text-brand-ui-primary">
              Voila! This is unlocked!
            </p>
            <a
              href={config.networks[lock!.network].explorer.urls.address(
                lock!.address
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
            >
              See in the block explorer
              <Icon key="external-link" icon={ExternalLinkIcon} size="small" />
            </a>
          </div>
          <AddToWallet
            lockAddress={lock!.address}
            network={lock!.network}
            tokenId={tokenId}
          />{' '}
        </div>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <div>
          {hasMessageToSign ? (
            <Button
              disabled={isSigningMessage}
              loading={isSigningMessage}
              onClick={onSign}
              className="w-full"
            >
              Sign message
            </Button>
          ) : (
            <div
              className={`gap-4 ${
                paywallConfig?.endingCallToAction
                  ? 'grid grid-cols-1'
                  : 'flex justify-between '
              }`}
            >
              <ReturningButton
                onClick={() => onClose(signedMessage)}
                returnLabel="Return"
                checkoutService={checkoutService}
              />
              {!lock?.isSoldOut &&
                !shouldSkip({ paywallConfig, lock }).skipRecipient && (
                  <Button
                    className="w-full"
                    onClick={() =>
                      checkoutService.send({ type: 'MAKE_ANOTHER_PURCHASE' })
                    }
                  >
                    Buy more
                  </Button>
                )}
            </div>
          )}
        </div>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
