import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { CustomComponentProps } from '../UpdateHooksForm'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { getEthersWalletFromPassword } from '~/utils/strings'
import { useFormContext } from 'react-hook-form'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'
import { useEffect, useState } from 'react'

export const PasswordCappedContractHook = ({
  lockAddress,
  network,
  hookAddress,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useFormContext()
  const { getWalletService } = useAuth()

  const {
    isLoading: isLoading,
    data: settings,
    refetch: reloadSettings,
  } = useGetLockSettings({
    lockAddress,
    network,
  })

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const savePassword = async ({
    password,
    cap,
  }: {
    password: string
    cap: number
  }) => {
    console.log({ password, cap, settings })
    // Save the code in lock settings
    const settingsPasswords = settings?.password ?? []
    // if (discount > 0) {
    //   settingsPasswords.push(code)
    //   await saveSettingsMutation({
    //     lockAddress,
    //     network,
    //     promoCodes: settingsPasswords.filter(
    //       (value, index, array) => array.indexOf(value) === index
    //     ),
    //   })
    // } else {
    //   await saveSettingsMutation({
    //     lockAddress,
    //     network,
    //     promoCodes: settingsPasswords.filter((value) => value !== code),
    //   })
    // }

    // Save the password in the hook!
    const walletService = await getWalletService(network)
    const signerAddress = await getEthersWalletFromPassword(password).address
    // await ToastHelper.promise(
    //   walletService.setDiscountCodeWithCapHookSigner({
    //     lockAddress,
    //     signerAddress,
    //     contractAddress: hookAddress,
    //     network,
    //     discountPercentage: discount,
    //     cap,
    //   }),
    //   {
    //     success: 'Promo code saved!',
    //     loading: 'Saving the promo code onchain...',
    //     error: 'Failed to save the promo code.',
    //   }
    // )
    await reloadSettings()
    return
  }

  const setPasswordMutation = useMutation(savePassword)

  const onSubmit = async ({ password, ...hooks }: any) => {
    await setEventsHooksMutation.mutateAsync(hooks)
    await setPasswordMutation.mutateAsync(password)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 text-sm"
    >
      <p>
        With this hook, you can set passwords that are required on your
        contract! You can set multiple passwords with different caps.
      </p>
      <table className="border-separate border-spacing-2">
        <tbody>
          <tr className="">
            <td className="">
              <Input
                size="small"
                error={errors.code?.message as string}
                placeholder="SECRET"
                label="Passwords:"
                {...register('password.password', {
                  required: true,
                })}
              />
            </td>
            <td className="">
              <Input
                size="small"
                error={errors.cap?.message as string}
                placeholder="100"
                label="Number of uses:"
                {...register('password.cap', {
                  valueAsNumber: true,
                  min: 0,
                  required: true,
                })}
              />
            </td>
            <td className="flex pt-7 flex-col items-center">
              <Button
                type="submit"
                className=""
                disabled={!isValid}
                size="small"
                loading={
                  setPasswordMutation.isLoading ||
                  setEventsHooksMutation.isLoading
                }
              >
                Add
              </Button>
            </td>
          </tr>

          {isLoading && (
            <Placeholder.Root>
              <Placeholder.Line size="sm" />
              <Placeholder.Line size="sm" />
            </Placeholder.Root>
          )}
          {!isLoading &&
            settings?.promoCodes?.map((code, i) => {
              return (
                <Password
                  savePassword={savePassword}
                  code={code}
                  key={i}
                  lockAddress={lockAddress}
                  hookAddress={hookAddress}
                  network={network}
                />
              )
            })}
        </tbody>
      </table>
    </form>
  )
}

interface PasswordProps {
  savePassword: (password: any) => void
  code: string
  lockAddress: string
  network: number
  hookAddress: string
}

export const Password = ({
  savePassword,
  code,
  lockAddress,
  hookAddress,
  network,
}: PasswordProps) => {
  const [loading, setLoading] = useState(false)
  const [passwordDetails, setPasswordDetails] = useState<{
    cap: number
    count: number
  } | null>(null)

  // Load the code details from the hook!
  useEffect(() => {
    const getPasswordDetails = async () => {
      const web3Service = new Web3Service(networks)
      const signerAddress = await getEthersWalletFromPassword(code).address
      setPasswordDetails(
        await web3Service.getDiscountHookWithCapValues({
          lockAddress,
          contractAddress: hookAddress,
          network,
          signerAddress,
        })
      )
    }
    getPasswordDetails()
  }, [code, hookAddress, lockAddress, network])

  if (!passwordDetails || passwordDetails.discount === 0) {
    return null
  }

  return (
    <tr>
      <td className="pl-2">{code}</td>
      <td className="pl-2">{passwordDetails.discount / 100}%</td>
      <td className="pl-2">
        {passwordDetails.count}/{passwordDetails.cap}
      </td>
      <td className="pl-2 flex flex-col items-center">
        {loading && <LoadingIcon size={24} />}
        {!loading && (
          <TrashIcon
            className="cursor-pointer"
            onClick={async () => {
              setLoading(true)
              await savePassword({ code, discount: 0, cap: 0 })
              setLoading(false)
            }}
          />
        )}
      </td>
    </tr>
  )
}
