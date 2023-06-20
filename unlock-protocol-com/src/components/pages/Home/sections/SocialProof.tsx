import React from 'react'
import Image from 'next/image'

interface Partner {
  logo: string
  url?: string
  alt?: string
}

interface SocialProofProps {
  description: string
  partners: Partner[]
}

const SOCIAL_PROOF: SocialProofProps = {
  description:
    'Trusted by developers building next generation membership products',
  partners: [
    {
      logo: '/images/partners/thirdweb.svg',
      alt: 'Thirdweb logo',
    },
    {
      logo: '/images/partners/consensys.svg',
      alt: 'Consensys logo',
    },
    {
      logo: '/images/partners/guild.svg',
      alt: 'Guild logo',
    },
    {
      logo: '/images/partners/dappcon.svg',
      alt: 'DappCon logo',
    },
    {
      logo: '/images/partners/metacartel.svg',
      alt: 'MetaCartel logo',
    },
    {
      logo: '/images/partners/ethtaipei.svg',
      alt: 'ETHTaipei logo',
    },
    {
      logo: '/images/partners/web3academemy.svg',
      alt: 'web3 Academy logo',
    },
    {
      logo: '/images/partners/ethsafari.svg',
      alt: 'ETHSafari logo',
    },
    {
      logo: '/images/partners/spruceID.svg',
      alt: 'SpruceID logo',
    },
    {
      logo: '/images/partners/cabincity.svg',
      alt: 'Cabin.city logo',
    },
    {
      logo: '/images/partners/edgenode.svg',
      alt: 'Edge & Node / The Graph logo',
    },
  ],
}
export default function SocialProof() {
  const { description, partners } = SOCIAL_PROOF
  return (
    <div className="flex flex-col gap-10 text-center">
      <span className="font-bold text-gray-700">{description}</span>
      <ul className="flex flex-row flex-wrap justify-between w-full md:mx-10 md:gap-0">
        {partners?.map(({ logo, alt }, index) => {
          return (
            <li
              key={index}
              className="flex items-center h-24 text-center rounded-full md:mx-2"
            >
              <div>
                <Image
                  width={60}
                  height={60}
                  className="object-contain w-full h-full mx-auto"
                  src={logo}
                  alt={alt}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
