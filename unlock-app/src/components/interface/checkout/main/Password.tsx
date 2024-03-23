import { CheckoutService } from './checkoutMachine'
import { FaCheck } from 'react-icons/fa'
import { FaXmark } from 'react-icons/fa6'

import { Connected } from '../Connected'
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
import LoadingIcon from '../../Loading'

import { useDebounce } from 'react-use'
import { useWeb3Service } from '~/utils/withWeb3Service'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

interface FormData {
  password: string
}

export function Password({ injectedProvider, checkoutService }: Props) {
  const { account } = useAuth()
  const [password, setPassword] = useState<string | undefined>('')
  const [hookAddress, setHookAddress] = useState<string>()
  const [isPasswordLoading, setPasswordLoading] = useState<boolean>(false)
  const [isPasswordCorrect, setIsPasswordCorrect] = useState<boolean>(false)

  const web3Service = useWeb3Service()
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
  }, [lock, web3Service])

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

  useDebounce(
    async () => {
      if (hookAddress && password) {
        setPasswordLoading(true)
        setIsPasswordCorrect(false)
        const privateKeyFromAccount = await getEthersWalletFromPassword(
          password
        )
        // Now check if this is a valid signer!
        const passwordDetails = await web3Service.getPasswordHookWithCapValues({
          lockAddress: lock!.address,
          network: lock!.network,
          contractAddress: hookAddress,
          signerAddress: privateKeyFromAccount.address,
        })
        setIsPasswordCorrect(passwordDetails.cap > 0)
        setPasswordLoading(false)
      }
    },
    200,
    [password, hookAddress, lock]
  )

  const iconRight = isPasswordLoading
    ? LoadingIcon
    : isPasswordCorrect
    ? () => (
        <Badge variant="green" size="tiny">
          <FaCheck />
        </Badge>
      )
    : password
    ? () => (
        <Badge variant="red" size="tiny">
          <FaXmark />
        </Badge>
      )
    : undefined

  let error = errors.password?.message
  if (!error && password && !isPasswordCorrect) {
    error = 'This password is not correct. '
  }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        <form id="password" className="space-y-4">
          <Input
            // @ts-ignore
            iconRight={iconRight}
            label="Enter password"
            description={
              !password &&
              'You need to enter the password to complete this step.'
            }
            required
            type="password"
            size="small"
            autoComplete="off"
            {...register('password', {
              required: true,
              min: 1,
            })}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(event.target.value)
            }}
            error={error}
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
            disabled={!isPasswordCorrect}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Next
          </Button>
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
