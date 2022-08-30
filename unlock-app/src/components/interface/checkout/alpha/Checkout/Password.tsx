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
import { FieldValues, useForm } from 'react-hook-form'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Password({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const { recipients, lock } = state.context
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm()

  const onSubmit = async (formData: FieldValues) => {
    try {
      const { password } = formData as Record<'password', string>
      if (!(password && recipients.length)) {
        return
      }
      const encoded = ethers.utils.defaultAbiCoder.encode(
        ['address', 'bytes32'],
        [lock!.address, ethers.utils.id(password)]
      )
      const privateKey = ethers.utils.keccak256(encoded)
      const privateKeyAccount = new ethers.Wallet(privateKey)
      const data = await Promise.all(
        recipients.map((address) =>
          privateKeyAccount.signMessage(address.toLowerCase())
        )
      )
      send({
        type: 'SUBMIT_PASSWORD',
        data,
      })
    } catch (error: any) {
      ToastHelper.error(error?.message)
    }
  }

  const stepItems = useCheckoutSteps(checkoutService)

  return (
    <Fragment>
      <Stepper position={6} service={checkoutService} items={stepItems} />
      <main className="h-full px-6 py-2 overflow-auto">
        <form id="password" className="space-y-4">
          <Input
            label="Enter password"
            description="You need to enter the password to purchase the key. If password is wrong, purchase will fail."
            required
            size="small"
            {...register('password', {
              required: true,
            })}
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
