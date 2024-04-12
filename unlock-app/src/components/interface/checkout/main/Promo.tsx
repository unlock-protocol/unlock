import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { networks } from '@unlock-protocol/networks'
import { Button, Input, Badge } from '@unlock-protocol/ui'
import { Fragment, useEffect, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/reactv4'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getEthersWalletFromPassword } from '~/utils/strings'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useDebounce } from 'react-use'
import LoadingIcon from '../../Loading'
import { useRouter } from 'next/router'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  recipients: string[]
  lock: any
  promoCode?: string
  send: (obj: any) => void
}

interface FormData {
  promo: string
}

const web3Service = new Web3Service(networks)

export const computePromoData = async (promo: string, recipients: string[]) => {
  const privateKeyAccount = await getEthersWalletFromPassword(promo)
  return Promise.all(
    recipients.map((address) => {
      const messageHash = ethers.utils.solidityKeccak256(
        ['string'],
        [address.toLowerCase()]
      )
      const messageHashBinary = ethers.utils.arrayify(messageHash)
      return privateKeyAccount.signMessage(messageHashBinary)
    })
  )
}

export function PromoContent({
  recipients,
  lock,
  promoCode,
  send,
  injectedProvider,
  checkoutService,
}: Props) {
  const { account } = useAuth()
  const [hookAddress, setHookAddress] = useState<string>()
  const [code, setCode] = useState<string | undefined>(promoCode)
  const [promoCodeLoading, setPromoCodeLoading] = useState<boolean>(false)
  const [promoCodeDetails, setPromoCodeDetails] = useState<any>()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormData>()
  const users = recipients.length > 0 ? recipients : [account!]

  useEffect(() => {
    const getHookAddress = async () => {
      setHookAddress(
        await web3Service.onKeyPurchaseHook({
          lockAddress: lock!.address,
          network: lock!.network,
        })
      )
    }
    getHookAddress()
  }, [lock])

  useDebounce(
    async () => {
      if (hookAddress && code) {
        setPromoCodeLoading(true)
        const privateKeyFromAccount = await getEthersWalletFromPassword(code)
        const promoCodeDetails = await web3Service.getDiscountHookWithCapValues(
          {
            lockAddress: lock!.address,
            network: lock!.network,
            contractAddress: hookAddress,
            signerAddress: privateKeyFromAccount.address,
          }
        )
        setPromoCodeDetails(promoCodeDetails)
        setPromoCodeLoading(false)
      }
    },
    100,
    [code, hookAddress, lock]
  )

  const onSubmit = async (formData: FormData) => {
    try {
      const { promo } = formData
      const data = await computePromoData(promo, users)
      send({
        type: 'SUBMIT_DATA',
        data,
      })
    } catch (error: any) {
      ToastHelper.error(error?.message)
    }
  }

  const isLoading = code && !promoCodeDetails

  const hasDiscount =
    promoCodeDetails &&
    promoCodeDetails.discount > 0 &&
    promoCodeDetails.cap > promoCodeDetails.count

  const iconRight = isLoading
    ? LoadingIcon
    : hasDiscount
    ? () => (
        <Badge variant="green" size="tiny">
          {promoCodeDetails.discount / 100}% Discount
        </Badge>
      )
    : promoCodeDetails?.discount > 0
    ? () => (
        <Badge variant="dark" size="tiny">
          Code expired
        </Badge>
      )
    : undefined

  let error = errors.promo?.message
  if (!error && code && promoCodeDetails?.discount === 0) {
    error = "We couldn't find a discount for this code. "
  }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        <form id="promo" className="space-y-4">
          <Input
            // @ts-ignore
            iconRight={iconRight}
            label="Enter Promo Code"
            description={
              !promoCodeDetails?.discount
                ? 'If you have a promo code to receive discounts, please enter it now.'
                : ''
            }
            type="text"
            size="small"
            {...register('promo', {
              value: code,
            })}
            error={error}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCode(event.target.value)
              setPromoCodeDetails(undefined)
            }}
          />
        </form>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <Button
            type="submit"
            form="promo"
            className="w-full"
            disabled={isSubmitting || promoCodeLoading}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {hasDiscount ? 'Next' : 'Skip'}
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}

interface PromoProps {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Promo({ injectedProvider, checkoutService }: PromoProps) {
  const [state, send] = useActor(checkoutService)
  const { query } = useRouter()
  const { recipients, lock, paywallConfig } = state.context

  let promoCode = ''
  if (query?.promo) {
    promoCode = query?.promo.toString()
  } else if (typeof paywallConfig.locks[lock!.address].promo === 'string') {
    promoCode = paywallConfig.locks[lock!.address].promo as string
  }

  return (
    <PromoContent
      recipients={recipients}
      lock={lock}
      promoCode={promoCode}
      send={send}
      injectedProvider={injectedProvider}
      checkoutService={checkoutService}
    />
  )
}
