import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useStorageService } from '~/utils/withStorageService'
import { LockAdvancedForm } from './LockAdvancedForm'
import { LockDetailForm } from './LockDetailForm'

export function UpdateLockMetadata() {
  const router = useRouter()
  const lockAddress = router.query.address!.toString()
  const network = Number(router.query.network)
  const storageService = useStorageService()

  const { data } = useQuery<Record<string, any>>(
    ['lockMetadata', lockAddress, network],
    async () => {
      const response = await storageService.locksmith.lockMetadata(
        network,
        lockAddress
      )
      return response.data
    },
    {
      initialData: {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onError() {},
      refetchInterval: Infinity,
      retry: false,
    }
  )

  const methods = useForm({
    defaultValues: data || {
      name: 'Locksmith 101',
      externalURL: 'https://example.com',
    },
  })

  const lockMetadata = useMutation(
    async (metadata: Record<string, any>) => {
      const token = await storageService.getAccessToken()
      const result = await storageService.locksmith.updateLockMetadata(
        network,
        lockAddress,
        {
          metadata,
        },
        {
          headers: storageService.genAuthorizationHeader(token),
        }
      )
      return result.data
    },
    {
      mutationKey: ['lockMetadata', lockAddress, network],
      onError(error) {
        ToastHelper.error(error as any)
      },
      onSuccess() {
        ToastHelper.success('Metadata successfully saved!')
      },
    }
  )

  const onSubmit = async (data: any) => {
    await lockMetadata.mutateAsync(data)
  }

  useEffect(() => {
    if (Object.keys(data).length) {
      methods.reset(data)
    }
  }, [data, methods])

  return (
    <div className="max-w-screen-md mx-auto">
      <header className="pt-2 pb-6 space-y-2">
        <h1 className="text-xl font-bold sm:text-3xl">Update Metadata</h1>
        <p className="text-lg text-gray-700">
          Adding the rich data to your membership
        </p>
      </header>
      <FormProvider {...methods}>
        <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid gap-6">
            <LockDetailForm disabled={lockMetadata.isLoading} />
            <LockAdvancedForm disabled={lockMetadata.isLoading} />
            <div className="flex justify-center">
              <Button
                disabled={lockMetadata.isLoading}
                loading={lockMetadata.isLoading}
                className="w-full max-w-sm"
              >
                Update
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
