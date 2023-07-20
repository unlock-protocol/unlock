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

interface LockTypeLandingPageProps {
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

export const LockTypeLandingPage = ({
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
}: LockTypeLandingPageProps) => {
  return (
    <div className="w-full">
      <section className="flex flex-col my-8 md:flex-row">
        {/* masthead */}
        <div className="flex flex-col py-0 ">
          {title}
          <h2 className="mt-4 text-3xl font-bold">{subtitle}</h2>
          <p className="my-6">{description}</p>
          {actions && (
            <div className="flex justify-center md:justify-start">
              {actions}
            </div>
          )}
        </div>
        <div className="w-96 justify-center hidden md:flex justify-items-center items-start shrink-0">
          {illustration}
        </div>
      </section>
      <div className="flex flex-col items-center content-center justify-center justify-items-center">
        <Image alt="cover image" width="770" height="160" src={coverImage} />
      </div>

      <section className="absolute left-0 flex flex-col items-center content-center justify-center w-screen py-8 text-white bg-black justify-items-center">
        <h1 className="text-xl font-semibold">Used by</h1>
        <ul className="flex gap-4 my-8 md:gap-0 md:flex-row">
          {customers?.map(({ link, image, name }: Customer) => {
            return (
              <li
                key={name}
                className="flex flex-col items-center h-24 max-w-xs gap-4 mx-2 text-center rounded-full md:mx-12"
              >
                <Link target="_blank" href={link}>
                  <div className="flex h-10 md:h-20">
                    <Image
                      width={100}
                      height={100}
                      className="object-contain w-full h-full mx-auto"
                      src={image}
                      alt={name}
                    />
                  </div>
                </Link>
                <h4 className="mt-auto text-xs md:text-base">{name}</h4>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="flex flex-col items-center content-center justify-center mt-96 justify-items-center">
        <div className="flex flex-col justify-center">
          <div className="flex flex-col gap-4 text-center">
            <span className="text-3xl font-semibold text-brand-ui-primary">
              {callToAction?.title}
            </span>
            <span className="text-3xl font-bold text-black md:text-5xl ">
              {callToAction?.subtitle}
            </span>
          </div>
          <ul className="grid gap-8 my-10 md:grid-cols-3">
            {features?.map(({ image, description }, index) => {
              return (
                <li className="flex flex-col gap-8" key={index}>
                  <Image
                    width="400"
                    height="300"
                    alt="problem-image"
                    src={image}
                  />
                  <p className="text-sm">{description}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
      <section className="flex flex-col items-center content-center justify-center mt-8 justify-items-center">
        {actions}
        <div className="text-xs text-center md:w-1/3">
          {callToAction?.description}
        </div>
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
