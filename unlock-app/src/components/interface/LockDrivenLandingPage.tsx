import { Disclosure } from '@headlessui/react'
import Link from 'next/link'
import Image from 'next/image'
import { BsPlusLg as PlusIcon } from 'react-icons/bs'
import { ReactNode } from 'react'
import { Icon } from '@unlock-protocol/ui'

interface AccordionProps {
  title: string
  children: React.ReactNode
}

interface Customer {
  link: string
  image: string
  name: string
}
interface Feature {
  image: string
  name: string
  description: string
}

interface Faq {
  title: string
  description: ReactNode
}

const Accordion = ({ title, children }: AccordionProps) => {
  return (
    <Disclosure>
      {() => (
        <>
          <Disclosure.Button className="flex justify-between w-full py-2 text-left border-t border-gray-600">
            <span className="text-xl font-semibold">{title}</span>
            <span className="mx-4 place-self-end">
              <Icon icon={PlusIcon} size={24} />
            </span>
          </Disclosure.Button>
          <Disclosure.Panel className="mb-8 text-sm md:w-2/3">
            {children}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

interface LockDrivenLandingPageProps {
  title: ReactNode
  subtitle: string
  description: string
  illustration: ReactNode // illustration image
  coverImage: string // cover image
  actions?: ReactNode
  faqs?: Faq[]
  features?: Feature[]
  customers?: Customer[]
  callToAction?: {
    title: ReactNode
    subtitle: ReactNode
    description: ReactNode
  }
}

export const LockDrivenLandingPage = ({
  title,
  subtitle,
  description,
  actions,
  faqs,
  illustration,
  coverImage,
  features,
  customers,
  callToAction,
}: LockDrivenLandingPageProps) => {
  return (
    <div>
      <section className="flex flex-col my-8 md:flex-row">
        {/* masthead */}
        <div className="flex flex-col py-0 md:pr-10">
          {title}
          <h2 className="mt-4 text-3xl font-bold">{subtitle}</h2>
          <p className="my-6">{description}</p>
          <p className="flex justify-center md:justify-start">{actions}</p>
        </div>
        <div className="justify-center hidden md:flex justify-items-center">
          {illustration}
        </div>
      </section>
      <div className="flex flex-col items-center content-center justify-center justify-items-center">
        <Image alt="cover image" width="1440" height="320" src={coverImage} />
      </div>

      <section className="absolute left-0 flex flex-col items-center content-center justify-center w-screen py-8 text-white bg-black justify-items-center">
        <h1 className="text-xl font-semibold">Used by</h1>
        <ul className="flex flex-row my-8">
          {customers?.map(({ link, image, name }: Customer) => {
            return (
              <li
                key={name}
                className="flex items-center w-24 h-24 mx-2 text-center rounded-full md:mx-12"
              >
                <Link target="_blank" href={link}>
                  <Image
                    width="100"
                    height="100"
                    alt={name}
                    src={image}
                  ></Image>
                  <h4 className="mt-auto">{name}</h4>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="flex flex-col items-center content-center justify-center mt-96 justify-items-center">
        <h3 className="text-5xl font-semibold text-center md:w-2/3">
          {callToAction?.title}
        </h3>
        <p className="mt-4 text-center md:w-1/2">{callToAction?.subtitle}</p>
        <ul className="grid md:grid-cols-[300px_300px_300px] gap-8 my-8">
          {features?.map(({ image, name, description }) => {
            return (
              <li key={name}>
                <Image
                  className="border rounded-lg border-1 border-ui-main-100"
                  width="400"
                  height="300"
                  alt="No-code"
                  src={image}
                ></Image>
                <h3 className="mt-2 mb-2 text-xl font-bold">{name}</h3>
                <p className="text-sm">{description}</p>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="flex flex-col items-center content-center justify-center mt-8 justify-items-center">
        {actions}
        <p className="text-xs text-center md:w-1/3">
          {callToAction?.description}
        </p>
      </section>
      {(faqs || [])?.length > 0 && (
        <section className="my-32">
          <h3 className="my-12 text-3xl font-bold text-center">
            Frequently Asked Questions
          </h3>
          {faqs?.map(({ title, description }, index) => {
            return (
              <Accordion key={index} title={title}>
                <p>{description}</p>
              </Accordion>
            )
          })}
        </section>
      )}
    </div>
  )
}
