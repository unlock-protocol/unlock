import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { networks } from '@unlock-protocol/networks'
import { Button, Input, Badge } from '@unlock-protocol/ui'
import { Fragment, useEffect, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getEthersWalletFromPassword } from '~/utils/strings'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { useDebounce } from 'react-use'
import LoadingIcon from '../../Loading'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface FormData {
  promo: string
}

const web3Service = new Web3Service(networks)

export function Promo({ injectedProvider, checkoutService }: Props) {
  const { account } = useAuth()
  const [state, send] = useActor(checkoutService)
  const [hookAddress, setHookAddress] = useState<string>()
  const [code, setCode] = useState<string>()
  const [promoCodeDetails, setPromoCodeDetails] = useState<any>()
  const { recipients, lock } = state.context
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isDirty },
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
      }
    },
    300,
    [code]
  )

  const onSubmit = async (formData: FormData) => {
    try {
      const { promo } = formData
      const privateKeyAccount = await getEthersWalletFromPassword(promo)
      const data = await Promise.all(
        users.map((address) => {
          const messageHash = ethers.utils.solidityKeccak256(
            ['string'],
            [address.toLowerCase()]
          )
          const messageHashBinary = ethers.utils.arrayify(messageHash)
          return privateKeyAccount.signMessage(messageHashBinary)
        })
      )
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
    : () => {
        if (hasDiscount) {
          return (
            <Badge variant="green" size="tiny">
              {promoCodeDetails.discount / 100}% Discount
            </Badge>
          )
        } else if (promoCodeDetails?.discount > 0) {
          return (
            <Badge variant="dark" size="tiny">
              Code expired
            </Badge>
          )
        }
        return null
      }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        <form id="promo" className="space-y-4">
          <Input
            iconRight={iconRight}
            label="Enter Promo Code"
            description="If you have a promo code to receive discounts, please enter it now."
            type="text"
            size="small"
            {...register('promo')}
            error={errors.promo?.message}
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
            disabled={isSubmitting}
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
