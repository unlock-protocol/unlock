import { Input } from '@unlock-protocol/ui'
import { useRouter } from 'next/router'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

export function LockDetailInputs() {
  const { register } = useFormContext()
  return (
    <div className="p-6 bg-white shadow">
      <div></div>
      <div>
        <Input
          {...register('name', {
            required: true,
          })}
          type="text"
          placeholder="LockSmith Daily Membership"
          label="Name"
          description="The name will appear as the NFT name, not as collection name."
        />
        <Input
          {...register('externalURL', {
            required: true,
          })}
          type="url"
          placeholder="https://example.com"
          label="External URL"
          description="Included a link in your NFT, so members can learn more about it."
        />
      </div>
    </div>
  )
}

export function LockMetadataPage() {
  const router = useRouter()
  const lockAddress = router.query.lockAddress?.toString()
  const network = Number(router.query.network)
  const methods = useForm({
    defaultValues: {
      name: 'Locksmith 101',
      externalURL: 'https://example.com',
    },
  })
  return (
    <div>
      <header>
        <h1>Update Metadata</h1>
        <p>Adding the rich data to your membership</p>
      </header>
      <main>
        <FormProvider {...methods}>
          <LockDetailInputs />
        </FormProvider>
      </main>
    </div>
  )
}
