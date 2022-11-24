import { Disclosure, Input, TextBox } from '@unlock-protocol/ui'
import { useFormContext } from 'react-hook-form'
import { MetadataFormData } from './utils'

interface Props {
  disabled?: boolean
}

export function LockDetailForm({ disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  const NameDescription = () => (
    <p>
      This will appear as each NFT&apos;s name on OpenSea on other marketplaces.{' '}
      <a
        className="text-brand-ui-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.youtube.com/watch?v=s_Lo2RxPYGA"
      >
        Edit your collection on Opensea.
      </a>
    </p>
  )

  const DescDescription = () => (
    <p>
      This is each NFT&apos;s description on OpenSea and other marketplaces.{' '}
      <a
        className="text-brand-ui-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.markdownguide.org/cheat-sheet"
      >
        Markdown is supported.
      </a>
    </p>
  )
  return (
    <Disclosure label="Basic" defaultOpen>
      <div className="grid gap-6">
        <Input
          {...register('name', {
            required: true,
          })}
          error={errors.name?.message}
          disabled={disabled}
          type="text"
          placeholder="Name"
          label="Name"
          description={<NameDescription />}
        />
        <Input
          {...register('external_url')}
          disabled={disabled}
          type="url"
          placeholder="https://"
          label="External URL"
          error={errors.external_url?.message}
          description="Include a link in the NFT, so members can learn more about it."
        />
        <TextBox
          {...register('description')}
          disabled={disabled}
          label="Description"
          placeholder="Write description here."
          description={<DescDescription />}
          error={errors.description?.message}
          rows={4}
        />
      </div>
    </Disclosure>
  )
}
