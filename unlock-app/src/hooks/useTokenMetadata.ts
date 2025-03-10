import { useWeb3Service } from '~/utils/withWeb3Service'
import { rewriteIpfsUrl } from '../utils/url'
import { useQuery } from '@tanstack/react-query'

const defaultMetadata = {
  image: '/images/svg/default-lock-logo.svg',
  name: 'NFT Membership',
}

/**
 * This hook retrieves metadata for a token
 * @param {*} address
 */
export const useTokenMetadata = (
  lockAddress: string,
  tokenId?: string,
  network?: number
) => {
  const web3Service = useWeb3Service()

  const { data: metadata = defaultMetadata } = useQuery({
    queryKey: ['metadata', lockAddress, tokenId, network],
    queryFn: async () => {
      let tokenMetadata = defaultMetadata
      try {
        const tokenURI = await web3Service.tokenURI(
          lockAddress,
          tokenId!,
          network!
        )
        tokenMetadata = await fetch(rewriteIpfsUrl(tokenURI)).then((response) =>
          response.json()
        )
        tokenMetadata.image = rewriteIpfsUrl(tokenMetadata.image)
      } catch (error) {
        // Do not fail on error, we'll keep defaulting to the default values
        console.error(
          `We could not retrieve the metadata for ${lockAddress}, ${tokenId} on ${network}: ${error}`
        )
      }
      return tokenMetadata
    },
    enabled: !!lockAddress && !!web3Service,
  })

  return metadata
}

export default useTokenMetadata
