import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button, Icon } from '@unlock-protocol/ui'
import { Fragment, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { StepItem, Stepper } from '../Stepper'
import { useQuery } from 'react-query'
import { getFiatPricing } from '~/hooks/useCards'
import { useConfig } from '~/utils/withConfig'
import { getLockProps } from '~/utils/lock'
import {
  RiExternalLinkLine as ExternalLinkIcon,
  RiTimer2Line as DurationIcon,
} from 'react-icons/ri'
import { useWalletService } from '~/utils/withWalletService'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { Pricing } from '../Lock'
import { LabeledItem } from '../LabeledItem'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  communication: CheckoutCommunication
}

export function Renew({
  checkoutService,
  injectedProvider,
  communication,
}: Props) {
  const [state, send] = useActor(checkoutService)
  const { account, signMessage } = useAuth()
  const config = useConfig()
  const walletService = useWalletService()
  const web3Service = useWeb3Service()
  const [isSigningMessage, setIsSigningMessage] = useState(false)
  const [isRenewing, setIsRenewing] = useState(false)
  const {
    paywallConfig,
    lock,
    messageToSign: signedMessage,
    password,
    captcha,
  } = state.context
  const { messageToSign, referrer } = paywallConfig
  const hasMessageToSign = !signedMessage && paywallConfig.messageToSign
  const { network: lockNetwork, address: lockAddress, name: lockName } = lock!
  const { isLoading: isFiatPricingLoading, data: fiatPricing } = useQuery(
    ['lockFiatPricing', lockAddress, lockNetwork],
    async () => {
      const pricing = await getFiatPricing(config, lockAddress, lockNetwork)
      return pricing
    }
  )
  const formattedData = getLockProps(
    {
      ...lock,
      fiatPricing,
    },
    lockNetwork,
    config.networks[lockNetwork].baseCurrencySymbol,
    lockName
  )

  const onRenew = async () => {
    try {
      setIsRenewing(true)
      if (!(lock && account)) {
        return
      }
      const onTransactionHandler = (
        error: Error | null,
        hash: string | null
      ) => {
        setIsRenewing(false)
        if (error) {
          send({
            type: 'CONFIRM_RENEW',
            status: 'ERROR',
            transactionHash: hash!,
          })
        } else {
          if (!paywallConfig.pessimistic && hash) {
            communication.emitTransactionInfo({
              hash,
              lock: lockAddress,
            })
            communication.emitUserInfo({
              address: account,
              signedMessage: signedMessage?.signature,
            })
          }
          send({
            type: 'CONFIRM_RENEW',
            status: 'PROCESSING',
            transactionHash: hash!,
          })
        }
      }
      if (lock.publicLockVersion! <= 9) {
        await walletService.purchaseKey(
          {
            lockAddress,
            owner: account,
            referrer,
          },
          onTransactionHandler
        )
      } else {
        const tokenId = await web3Service.tokenOfOwnerByIndex(
          lockAddress,
          account,
          0,
          lockNetwork
        )
        await walletService.extendKey(
          {
            lockAddress,
            tokenId: tokenId.toString(),
            referrer,
            data: password || captcha || undefined,
          },
          onTransactionHandler
        )
      }
    } catch (error: any) {
      setIsRenewing(false)
      ToastHelper.error(error?.message)
    }
  }
  const onSign = async () => {
    setIsSigningMessage(true)
    try {
      const signature = await signMessage(messageToSign!)
      setIsSigningMessage(false)
      send({
        type: 'SIGN_MESSAGE',
        signature,
        address: account!,
      })
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(error.message)
      }
      setIsSigningMessage(false)
    }
  }

  const stepItems: StepItem[] = [
    {
      id: 1,
      name: 'Select lock',
      to: 'SELECT',
    },
    {
      id: 2,
      name: 'Renew membership',
      to: 'RENEW',
    },
    {
      id: 3,
      name: 'Renewed!',
    },
  ]

  return (
    <Fragment>
      <Stepper position={2} service={checkoutService} items={stepItems} />
      <main className="h-full p-6 space-y-2 overflow-auto">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-bold">{lockName}</h3>
            {!isFiatPricingLoading ? (
              <div className="grid">
                <Pricing
                  keyPrice={formattedData.formattedKeyPrice}
                  usdPrice={formattedData.convertedKeyPrice}
                  isCardEnabled={formattedData.cardEnabled}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 p-2 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="w-16 p-2 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
            )}
          </div>
          {!isFiatPricingLoading ? (
            <div className="space-y-2">
              <ul className="flex items-center gap-4 text-sm">
                <LabeledItem
                  label="Duration"
                  icon={DurationIcon}
                  value={formattedData.formattedDuration}
                />
              </ul>
              <a
                href={config.networks[lockNetwork].explorer.urls.address(
                  lockAddress
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
              >
                View Contract <Icon icon={ExternalLinkIcon} size="small" />
              </a>
            </div>
          ) : (
            <div className="py-1.5 space-y-2 items-center">
              <div className="p-2 bg-gray-100 rounded-lg w-52 animate-pulse"></div>
              <div className="p-2 bg-gray-100 rounded-lg w-52 animate-pulse"></div>
            </div>
          )}
        </div>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
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
            <Button
              disabled={isRenewing}
              loading={isRenewing}
              onClick={() => {
                onRenew()
              }}
              className="w-full"
            >
              Renew membership
            </Button>
          )}
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
