import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button, Input } from '@unlock-protocol/ui'
import { Fragment } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useCheckoutSteps } from './useCheckoutItems'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface FormData {
  password: string
}

export function Password({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const { recipients, renew } = state.context
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormData>()

  const onSubmit = async (formData: FormData) => {
    try {
      const { password } = formData
      const encoded = ethers.utils.defaultAbiCoder.encode(
        ['bytes32'],
        [ethers.utils.id(password)]
      )
      const privateKey = ethers.utils.keccak256(encoded)
      const privateKeyAccount = new ethers.Wallet(privateKey)
      const data = await Promise.all(
        recipients.map((address) => {
          const messageHash = ethers.utils.solidityKeccak256(
            ['string'],
            [address.toLowerCase()]
          )
          const messageHashBinary = ethers.utils.arrayify(messageHash)
          return privateKeyAccount.signMessage(messageHashBinary)
        })
      )
      send({
        type: 'SUBMIT_PASSWORD',
        data,
      })
    } catch (error: any) {
      ToastHelper.error(error?.message)
    }
  }

  const stepItems = useCheckoutSteps(checkoutService, renew)

  return (
    <Fragment>
      <Stepper
        position={renew ? 2 : 6}
        service={checkoutService}
        items={stepItems}
      />
      <main className="h-full px-6 py-2 overflow-auto">
        <form id="password" className="space-y-4">
          <Input
            label="Enter password"
            description="You need to enter the password to purchase the key. If password is wrong, purchase will fail."
            required
            type="password"
            size="small"
            {...register('password', {
              required: true,
              min: 1,
            })}
            error={errors.password?.message}
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
            form="password"
            className="w-full"
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Submit password
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
