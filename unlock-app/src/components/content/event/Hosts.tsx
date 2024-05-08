import { Placeholder } from '@unlock-protocol/ui'
import Image from 'next/image'
import Link from 'next/link'
import { useSocials } from '~/hooks/useSocials'
import { FaUser } from 'react-icons/fa'
import { rewriteIpfsUrl } from '~/utils/url'

interface HostsProps {
  organizers?: string[]
}

export const Hosts = ({ organizers }: HostsProps) => {
  const { socials, loading, error } = useSocials(organizers || [])

  if (error) {
    console.error(error)
    return null
  }
  if (loading || !socials) {
    return (
      <Placeholder.Root>
        <Placeholder.Line />
      </Placeholder.Root>
    )
  }

  if (Object.values(socials).length > 0) {
    return (
      <div className="flex md:items-center whitespace-nowrap">
        Hosted by:
        <ul className="flex ml-2 gap-2 flex-wrap flex-row">
          {Object.values(socials).map((social) => {
            if (social.profileUrl) {
              return (
                <li key={social.id} className="flex items-center gap">
                  <Link
                    target="_blank"
                    className="hover:underline flex items-center gap-1"
                    href={social.profileUrl}
                  >
                    {social.profileImage && (
                      <Image
                        className="rounded-full border object-cover aspect-1"
                        alt={social.profileName}
                        width={20}
                        height={20}
                        src={rewriteIpfsUrl(social.profileImage)}
                      />
                    )}
                    {!social.profileImage && <FaUser size={16} />}
                    {social.profileDisplayName}
                  </Link>
                </li>
              )
            }
            return (
              <li key={social.id} className="flex items-center gap-1">
                {social.profileImage && (
                  <Image
                    className="rounded-full border"
                    alt={social.profileName}
                    width={32}
                    height={32}
                    src={rewriteIpfsUrl(social.profileImage)}
                  />
                )}
                {social.profileDisplayName}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
  return null
}

export default Hosts
