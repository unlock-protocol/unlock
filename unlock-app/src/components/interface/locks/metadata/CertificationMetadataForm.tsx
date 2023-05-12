import { Disclosure, Input } from '@unlock-protocol/ui'
import { useFormContext, useWatch } from 'react-hook-form'
import { MetadataFormData } from './utils'
import Link from 'next/link'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { getCertificationPath } from '~/components/content/certification/utils'

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
    formState: { errors },
    control,
  } = useFormContext<MetadataFormData>()

  const { slug } = useWatch({
    control,
  })

  const certificationPageUrl = new URL(
    `${window.location.origin}${getCertificationPath({
      lockAddress,
      network,
      metadata: {
        slug,
      },
    })}`
  )

  return (
    <div>
      <Disclosure label="Certification">
        <>
          <p>
            Add NFT properties if your NFTs are certifications. These will be
            displayed on NFT marketplaces and wallets that support them.
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
                {...register('certification.certification_issuer')}
                disabled={disabled}
                type="text"
                label="Official name of the issuer"
                description="Please enter the name of the organization that issues the certificates."
                error={errors.certification?.certification_issuer?.message}
              />
            </div>
          </div>
        </>
      </Disclosure>
    </div>
  )
}
