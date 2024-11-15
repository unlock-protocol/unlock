import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { ethers } from 'ethers'
import { CustomComponentProps } from '../UpdateHooksForm'
import { Button, TextBox } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  useGetLockSettings,
  useSaveLockSettings,
} from '~/hooks/useLockSettings'

export const AllowListHook = ({
  lockAddress,
  network,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const { data: settings } = useGetLockSettings({
    lockAddress,
    network,
  })

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext()

  // initialize the form field with the fetched setting
  useEffect(() => {
    if (settings?.allowList !== undefined) {
      setValue('hook.allowList', settings.allowList)
    }
  }, [settings, setValue])

  const onSubmit = async (values: any) => {
    const allowList = getValues('hook.allowList').toString()

    const tree = StandardMerkleTree.of(
      allowList.split('\n').map((approved: string) => [approved, '1']),
      ['address', 'uint256']
    )
    console.log(tree)
    // Save the list!
    await saveSettingsMutation({
      lockAddress,
      network,
      allowList,
    })
    // Then, create the merkle proof

    // Then, save the proof

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
