import { useQuery } from '@airstack/airstack-react'

interface Social {
  id: string
  profileName: string
  profileImage: string
  profileDisplayName: string
  profileUrl: string
}
interface Socials {
  [address: string]: Social
}

const query = `query DomainsAndSocials($wallets: [Address!]) {
  Domains(
    input: {
      filter: {
        isPrimary: {
          _eq: true
        }, 
        resolvedAddress: {
          _in: $wallets
        }
      }, 
      blockchain: ethereum
    }) {
    Domain {
      resolvedAddress
      name
    }
  }
  Socials(
    input: {
      filter: {
        userAssociatedAddresses: {
          _in: $wallets
        }
      }, 
      blockchain: ethereum
    }) {
    Social {
      dappName
      profileName
      profileUrl
      userAssociatedAddresses
      id
      profileDisplayName
      profileHandle
      profileImage
      userAssociatedAddresses
    }
  }
}`

export const useSocials = (addresses: string[]) => {
  const socials: Socials = {} as Socials

  const { data, loading, error } = useQuery(query, {
    wallets: addresses,
  })

  if (data) {
    data.Socials?.Social?.forEach((social: any) => {
      social.userAssociatedAddresses.forEach((address: string) => {
        if (addresses.indexOf(address) > -1) {
          const existing = socials[address] || {}
          // prioritize Farcaster (profiles are more complete!)
          if (social.dappName === 'farcaster') {
            socials[address] = {
              id: social.id,
              profileName: social.profileName,
              profileImage: social.profileImage,
              profileDisplayName:
                social.profileDisplayName || social.profileName,
              profileUrl:
                social.profileUrl ||
                `https://warpcast.com/${social.profileHandle}`,
            }
          } else if (social.dappName === 'lens' && !existing.id) {
            socials[address] = {
              id: social.id,
              profileName: social.profileName,
              profileImage: social.profileImage,
              profileDisplayName:
                social.profileDisplayName || social.profileName,
              profileUrl:
                social.profileUrl ||
                `https://hey.xyz/u/${social.profileHandle}`,
            }
          }
        }
      })
    })
  }
  return { socials, loading, error }
}
