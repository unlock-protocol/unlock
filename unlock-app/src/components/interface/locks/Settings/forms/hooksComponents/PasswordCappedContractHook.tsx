import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { CustomComponentProps } from '../UpdateHooksForm'
import { useMutation } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { FaTrash as TrashIcon } from 'react-icons/fa'
import { getEthersWalletFromPassword } from '~/utils/strings'
import { useFormContext } from 'react-hook-form'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'
import { useEffect, useState } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useProvider } from '~/hooks/useProvider'

export const PasswordCappedContractHook = ({
  lockAddress,
  network,
  hookAddress,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const web3Service = useWeb3Service()
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid },
  } = useFormContext()
  const { getWalletService } = useProvider()
  const [passwords, setPasswords] = useState<
    { password: string; cap: number; count: number }[]
  >([])

  const {
    isLoading: isLoading,
    data: settings,
    refetch: reloadSettings,
  } = useGetLockSettings({
    lockAddress,
    network,
  })

  useEffect(() => {
    const loadPasswordDetails = async () => {
      if (settings?.passwords) {
        const passwordDetails = await Promise.all(
          settings.passwords.map(async (password) => {
            const signerAddress =
              await getEthersWalletFromPassword(password).address
            const details = await web3Service.getPasswordHookWithCapValues({
              lockAddress,
              signerAddress,
              contractAddress: hookAddress,
              network,
            })
            return { ...details, password }
          })
        )
        setPasswords(passwordDetails.filter((value) => value.cap > 0))
      }
    }
    loadPasswordDetails()
  }, [settings])

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const savePassword = async ({
    password,
    cap,
  }: {
    password: string
    cap: number
  }) => {
    // Save the code in lock settings
    const settingsPasswords = settings?.passwords ?? []
    if (!settingsPasswords.includes(password)) {
      settingsPasswords.push(password)
    }
    await saveSettingsMutation({
      lockAddress,
      network,
      passwords: settingsPasswords.filter(
        (value, index, array) => array.indexOf(value) === index
      ),
    })
    // Save the password in the hook!
    const walletService = await getWalletService(network)
    const signerAddress = await getEthersWalletFromPassword(password).address
    await ToastHelper.promise(
      walletService.setPasswordWithCapHookSigner({
        lockAddress,
        signerAddress,
        contractAddress: hookAddress,
        network,
        cap,
      }),
      {
        success: 'Password saved!',
        loading: 'Saving the password onchain...',
        error: 'Failed to save the password.',
      }
    )
    await reloadSettings()
  }

  const setPasswordMutation = useMutation({
    mutationFn: savePassword,
  })

  const onSubmit = async ({ password, ...hooks }: any) => {
    await setEventsHooksMutation.mutateAsync(hooks)
    await setPasswordMutation.mutateAsync(password)
    reset()
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
                  setPasswordMutation.isPending ||
                  setEventsHooksMutation.isPending
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
            passwords.map(({ password, cap, count }, i) => {
              return (
                <Password
                  savePassword={savePassword}
                  password={password}
                  cap={cap}
                  key={i}
                  count={count}
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
  password: string
  cap: number
  count: number
}

export const Password = ({
  savePassword,
  password,
  cap,
  count,
}: PasswordProps) => {
  const deletePassword = async (password: string) => {
    await savePassword({ password, cap: 0 })
  }

  return (
    <tr>
      <td className="pl-2">{password}</td>
      <td className="pl-2">
        {Number(count)}/{Number(cap)}
      </td>
      <td className="pl-2 flex flex-col items-center">
        <TrashIcon
          className="cursor-pointer"
          onClick={async () => {
            await deletePassword(password)
          }}
        />
      </td>
    </tr>
  )
}
