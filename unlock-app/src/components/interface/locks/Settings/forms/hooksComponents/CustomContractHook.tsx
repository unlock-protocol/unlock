import { Button, Input } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { CustomComponentProps } from '../UpdateHooksForm'
import { useFormContext } from 'react-hook-form'

export const CustomContractHook = ({
  name,
  disabled,
  setEventsHooksMutation,
}: CustomComponentProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useFormContext()

  const hasError = errors?.[name] ?? false

  const onSubmit = async (values: any) => {
    // Just save the addresses!
    setEventsHooksMutation.mutateAsync(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Input
        size="small"
        label="Contract address:"
        {...register(name, {
          validate: ethers.isAddress,
        })}
        disabled={disabled}
        placeholder="Contract address"
        error={hasError ? 'Enter a valid address' : ''}
      />
      <div className="ml-auto">
        <Button size="small" loading={setEventsHooksMutation.isLoading}>
          Save
        </Button>
      </div>
    </form>
  )
}
