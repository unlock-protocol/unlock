import { useSocials } from '~/hooks/useSocials'
import { Placeholder } from '@unlock-protocol/ui'
import Link from 'next/link'
import Image from 'next/image'
import { rewriteIpfsUrl } from '~/utils/url'

export const OwnerSocials = ({ owner }: { owner: string }) => {
  const { socials, loading } = useSocials([owner])
  const size = 90
  if (loading) {
    return (
      <Placeholder.Root>
        <Placeholder.Image className={`w-size h-${size}`} />
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="md" />
      </Placeholder.Root>
    )
  }
  const social = socials[owner]
  if (!social) {
    return (
      <div className="flex ml-2 gap-2 flex-wrap flex-row">
        <h1 className="text-3xl font-bold grow justify-left">
          Member Keychain
        </h1>
        <div className="w-full text-base text-gray-700">
          A Key is a membership or ticket NFT created on Unlock Protocol
        </div>
      </div>
    )
  }
  return (
    <div className="flex ml-2 gap-2 flex-wrap flex-row">
      {social.profileImage && (
        <Image
          className="rounded-full border"
          alt={social.profileName}
          width={size}
          height={size}
          src={rewriteIpfsUrl(social.profileImage)}
        />
      )}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold grow justify-left">
          Member Keychain
        </h1>
        <p>
          All Unlock powered memberships, tickets and certifications owned by{' '}
          {social.profileUrl ? (
            <Link
              target="_blank"
              className="underline text-brand-ui-primary"
              href={social.profileUrl}
            >
              {social.profileDisplayName}
            </Link>
          ) : (
            social.profileDisplayName
          )}
          .
        </p>
      </div>
    </div>
  )
}

export default OwnerSocials
