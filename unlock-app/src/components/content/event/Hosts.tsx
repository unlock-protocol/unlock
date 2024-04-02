import { Placeholder } from '@unlock-protocol/ui'
import Image from 'next/image'
import Link from 'next/link'
import { useSocials } from '~/hooks/useSocials'
import { FaUser } from 'react-icons/fa'

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

  return (
    <div className="flex items-center">
      Hosted by:
      <ul className="flex ml-2 gap-2">
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
                      className="rounded-full border"
                      alt={social.profileName}
                      width={20}
                      height={20}
                      src={social.profileImage}
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
                  src={social.profileImage}
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

export default Hosts
