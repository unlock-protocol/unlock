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
import { getEthersWalletFromPassword } from '~/utils/strings'
import { usePasswordHookSigner } from '~/hooks/useHooks'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface FormData {
  password: string
}

export function Password({ injectedProvider, checkoutService }: Props) {
  const { account } = useAuth()
  const [state, send] = useActor(checkoutService)
  const { recipients, lock } = state.context
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    mode: 'onSubmit',
  })
  const users = recipients.length > 0 ? recipients : [account!]

  const { isLoading: isLoadingSigner, data: passwordSigner } =
    usePasswordHookSigner({
      lockAddress: lock!.address,
      network: lock!.network,
    })

  const onSubmit = async (formData: FormData) => {
    try {
      const { password } = formData
      const privateKeyAccount = getEthersWalletFromPassword(password)
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
              validate: (password: string) => {
                const { address } = getEthersWalletFromPassword(password) ?? {}
                // check if password match
                if (passwordSigner && passwordSigner !== address) {
                  return 'Wrong password...'
                }
                return true
              },
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
            disabled={isLoadingSigner}
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
