import { Disclosure, Input } from '@unlock-protocol/ui'
import { useFormContext, useWatch } from 'react-hook-form'
import { MetadataFormData } from './utils'
import Link from 'next/link'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'

interface Props {
  disabled?: boolean
  lockAddress: string
  network: number
}

export function CertificationMetadataForm({
  disabled,
  lockAddress,
  network,
}: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<MetadataFormData>()

  const { certification } = useWatch({
    control,
  })

  console.log('certification', certification)

  const certificationPageUrl = new URL(
    `${window.location.origin}/certification?lockAddress=${lockAddress}&network=${network}`
  )

  return (
    <div>
      <Disclosure label="Certification">
        <>
          <p>
            Add NFT properties for certification. These will be displayed on NFT
            marketplaces and wallets that support them.
          </p>
          <p className="">
            These properties will also be displayed on{' '}
            <Link
              className="inline-flex items-center underline "
              target="newline"
              href={certificationPageUrl}
            >
              your certification page <ExternalLinkIcon className="ml-1" />
            </Link>
            .
          </p>
          <div className="grid items-center gap-4 mt-4">
            <div className="flex flex-col self-start justify-top">
              <Input
                {...register('certification.issuer')}
                disabled={disabled}
                type="text"
                label="Official Name Of The Issuer"
                description="This is part of metadata to store the official name of issuer"
                error={
                  // @ts-ignore
                  errors.certification?.issuer?.message
                }
              />
            </div>
          </div>
        </>
      </Disclosure>
    </div>
  )
}
