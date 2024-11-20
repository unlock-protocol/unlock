import { ethers } from 'ethers'
import { CustomComponentProps } from '../UpdateHooksForm'
import { Button, TextBox } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useProvider } from '~/hooks/useProvider'

export const AllowListHook = ({
  lockAddress,
  network,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const { getWalletService } = useProvider()

  const { data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const saveMerkleProof = useMutation({
    mutationFn: async ({
      allowList,
      hookAddress,
    }: {
      allowList: string[]
      hookAddress: string
    }) => {
      const { data: tree } = await locksmith.saveMerkleTree(allowList)
      const walletService = await getWalletService(network)
      await ToastHelper.promise(
        walletService.setMerkleRoot({
          network,
          lockAddress,
          hookAddress,
          root: tree.root!,
        }),
        {
          success: 'The allow-list was saved onchain!',
          loading: 'Saving the allow-list onchain...',
          error: 'Failed to save the allow-list.',
        }
      )
    },
  })

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext()

  // initialize the form field with the fetched setting
  useEffect(() => {
    if (settings?.allowList) {
      setValue('hook.allowList', settings.allowList.join('\n'))
    }
  }, [settings, setValue])

  const onSubmit = async (values: any) => {
    const allowList = getValues('hook.allowList')
      .split('\n')
      .filter((line: string) => line.trim() !== '')
      .map((line: string) => line.trim())

    // Save the list!
    await saveSettingsMutation({
      lockAddress,
      network,
      allowList,
    })

    // Then, create the merkle proof and save the proof
    await saveMerkleProof.mutateAsync({
      allowList,
      hookAddress: values.keyPurchase,
    })

    // Save the hook!
    await setEventsHooksMutation.mutateAsync(values)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 text-sm"
    >
      <p>
        With this hook, you can set an allow-list of addresses that are approved
        to mint memberships from your contract. Other addresses will be
        rejected.
      </p>

      <TextBox
        label={'Allow List'}
        size={'small'}
        description={'Please, enter one single address per line.'}
        {...register('hook.allowList', {
          validate: (value) => {
            const anyLineInvalid = value
              .split('\n')
              .filter((line: string) => line.trim() !== '')
              .map((line: string) => {
                return !ethers.isAddress(line.trim())
              })
              .some((invalid: boolean) => invalid)
            if (anyLineInvalid) {
              return 'One or more addresses are invalid'
            }
            return !anyLineInvalid
          },
          required: {
            value: true,
            message: 'This field is required',
          },
        })}
        // @ts-expect-error Property 'allowList' does not exist on type 'FieldError'.
        error={errors?.hook?.allowList?.message}
      />

      <div className="ml-auto">
        <Button
          loading={setEventsHooksMutation.isLoading}
          size="small"
          type="submit"
        >
          Save
        </Button>
      </div>
    </form>
  )
}
