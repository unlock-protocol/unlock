import Image from 'next/image'
import Link from 'next/link'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'

const options = [
  {
    image: {
      src: '/images/illustrations/deploy-lock/subscription.png',
      width: 250,
      height: 250,
      alt: 'create subscription',
    },
    cta: 'Create an onchain subscription',
    href: '/subscription/new',
  },
  {
    image: {
      src: '/images/illustrations/deploy-lock/event.png',
      width: 250,
      height: 250,
      alt: 'organize event',
    },
    cta: 'Organize an event and sell tickets',
    href: '/event/new',
  },
  {
    image: {
      src: '/images/illustrations/deploy-lock/certification.png',
      width: 250,
      height: 250,
      alt: 'create certification',
    },
    cta: 'Certify the expertise onchain',
    href: '/certification/new',
  },
  {
    image: {
      src: '/images/illustrations/deploy-lock/custom-membership.png',
      width: 250,
      height: 250,
      alt: 'create a custom membership',
    },
    cta: 'Deploy a custom membership',
    href: '/locks/create',
  },
]

export const Launcher = () => {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold mb-2">
        What do you want to achieve today?
      </h1>
      <h2 className="text-lg font-light text-center">
        Let&apos;s begin by selecting a starting point that has easy and
        <br />
        manageable steps for you to follow! 😊
      </h2>
      <ul className="flex gap-4 mt-8 mb-12 flex-col md:flex-row flex-wrap justify-center ">
        {options.map(({ cta, image, href }) => (
          <li
            key={image.alt}
            className="relative h-80 w-80 overflow-hidden bg-[#FFF7E8]  rounded-lg duration-200 hover:drop-shadow-2xl"
          >
            <Link href={href}>
              <div className="flex flex-col items-center">
                <Image
                  className="mt-4"
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  src={image.src}
                ></Image>
              </div>
              <div className="absolute bottom-0 w-full p-4 bg-white flex">
                <p className="font-light">{cta}</p>
                <ExternalLinkIcon className="ml-auto text-brand-ui-primary" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
