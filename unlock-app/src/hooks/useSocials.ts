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
      profileImageContentValue {
        image {
          original
        }
      }
      profileUrl
      userAssociatedAddresses
      blockchain
      chainId
      dappName
      coverImageURI
      dappSlug
      dappVersion
      fnames
      followerCount
      followerTokenAddress
      followingCount
      handleTokenAddress
      handleTokenId
      id
      identity
      isDefault
      isFarcasterPowerUser
      location
      metadataURI
      profileBio
      profileCreatedAtBlockNumber
      profileCreatedAtBlockTimestamp
      profileDisplayName
      profileHandle
      profileImage
      profileLastUpdatedAtBlockNumber
      profileLastUpdatedAtBlockTimestamp
      profileMetadata
      profileName
      profileTokenAddress
      profileTokenId
      profileTokenIdHex
      profileTokenUri
      profileUrl
      twitterUserName
      updatedAt
      userAddress
      userAssociatedAddresses
      userCreatedAtBlockNumber
      userCreatedAtBlockTimestamp
      userHomeURL
      userId
      userLastUpdatedAtBlockNumber
      userLastUpdatedAtBlockTimestamp
      userRecoveryAddress
      website
    }
  }
}`

export const useSocials = (addresses: string[]) => {
  const socials: Socials = {} as Socials

  const { data, loading, error } = useQuery(query, {
    wallets: ['0xF41a98D4F2E52aa1ccB48F0b6539e955707b8F7a', ...addresses],
  })

  if (data) {
    data.Socials?.Social?.forEach((social: any) => {
      social.userAssociatedAddresses.forEach((address: string) => {
        if (addresses.indexOf(address) > -1) {
          const existing = socials[address] || {}
          let profileUrl = social.profileUrl
          if (social.dappName === 'farcaster') {
            profileUrl = `https://warpcast.com/${social.profileHandle}`
          } else if (social.dappName === 'lens') {
            profileUrl = `https://hey.xyz/u/${social.profileHandle}`
          }
          socials[address] = {
            id: existing.id || social.id,
            profileName: existing.profileName || social.profileName,
            profileImage: existing.profileImage || social.profileImage,
            profileDisplayName:
              existing.profileDisplayName ||
              social.profileDisplayName ||
              social.profileName,
            profileUrl: existing.profileUrl || profileUrl,
          }
        }
      })
    })
  }
  return { socials, loading, error }
}
