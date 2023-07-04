import Image from 'next/image'
import Link from 'next/link'

const options = [
  {
    image: '/images/illustrations/events/outmetaverse.svg',
    cta: 'Organize an event and sell tickets',
    alt: 'organize event',
    href: '/event/new',
  },
  {
    image: '/images/illustrations/certifications/img-handoffDoc.svg',
    cta: 'Certify & Show the expertise on chain.',
    alt: 'create certification',
    href: '/certification/new',
  },
]

export const Launcher = () => {
  return (
    <div>
      <h1>What do you want to achieve today?</h1>
      <h2>
        Let&apos;s begin by selecting a starting point that has easy and
        manageable steps for you to follow! 😊
      </h2>
      <ul className="flex gap-4">
        {options.map((option) => (
          <li
            key={option.alt}
            className="relative h-96 overflow-hidden bg-[#FFF7E8] w-96 rounded-lg drop-shadow-2xl"
          >
            <Link href={option.href}>
              <Image
                className="mt-4 justify-self-center"
                alt={option.alt}
                width="513"
                height="652"
                src={option.image}
              ></Image>
              <p className="bg-white font-light absolute bottom-0 w-full p-4">
                {option.cta}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p>
        I am not sure yet,{' '}
        <Link
          className="underline font-semibold text-brand-ui-primary"
          href="/locks/create"
        >
          let me create my own membership contract
        </Link>
      </p>
    </div>
  )
}
