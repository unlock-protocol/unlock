import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button, Input } from '@unlock-protocol/ui'
import { Fragment } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { useAuth } from '~/contexts/AuthenticationContext'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface FormData {
  promo: string
}

export function Promo({ injectedProvider, checkoutService }: Props) {
  const { account } = useAuth()
  const [state, send] = useActor(checkoutService)
  const { recipients } = state.context
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<FormData>()
  const users = recipients.length > 0 ? recipients : [account!]

  const onSubmit = async (formData: FormData) => {
    try {
      const { promo } = formData
      const encoded = ethers.utils.defaultAbiCoder.encode(
        ['bytes32'],
        [ethers.utils.id(promo)]
      )

      const privateKey = ethers.utils.keccak256(encoded)
      const privateKeyAccount = new ethers.Wallet(privateKey)
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

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        <form id="promo" className="space-y-4">
          <Input
            label="Enter Promo Code"
            description="If you have a promo code to receive discounts, please enter it now."
            type="text"
            size="small"
            {...register('promo')}
            error={errors.promo?.message}
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
            {isDirty ? 'Next' : 'Skip'}
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
