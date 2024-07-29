import { Disclosure } from '@headlessui/react'
import Image from 'next/image'
import { BsPlusLg as PlusIcon } from 'react-icons/bs'
import { ReactNode } from 'react'
import { Icon } from '@unlock-protocol/ui'

interface AccordionProps {
  title?: string
  children: React.ReactNode
}

interface Customer {
  link?: string
  image: string
  name: string
  children?: ReactNode
}
interface Feature {
  image: string
  name: string
  description: string
}

interface Problem {
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
  customers?: {
    title?: string
    items?: Customer[]
  }
  problemSection?: {
    title: string
    subtitle?: string
    items?: Problem[]
  }
  callToAction?: {
    title: ReactNode
    subtitle: ReactNode
    description: ReactNode
    actions?: ReactNode
  }
}

export const LockTypeLandingPage = ({
  title,
  subtitle,
  description,
  actions,
  faqs,
  illustration,
  features,
  customers = {
    title: '',
    items: [],
  },
  callToAction,
  problemSection,
}: LockTypeLandingPageProps) => {
  return (
    <div className="w-full mt-8 flex flex-col gap-12 md:gap-24">
      <section className="gap-2 flex flex-row">
        {/* masthead */}
        <div className="md:w-2/3  md:flex md:flex-col">
          {title}
          <h2 className="mt-4 text-3xl font-bold">{subtitle}</h2>
          <p className="my-6">{description}</p>
          {actions && (
            <div className="flex justify-center md:justify-start">
              {actions}
            </div>
          )}
        </div>
        <div className="hidden md:block">{illustration}</div>
      </section>

      <section className="flex flex-col items-center content-center justify-center text-whit justify-items-center">
        <div className="flex flex-col gap-10 text-center">
          <span className="font-bold text-gray-700">
            {customers?.title || 'Used by'}
          </span>
          <ul className="flex flex-row flex-wrap justify-around gap-4 md:mx-10">
            {customers?.items?.map(({ image, name, children }, index) => {
              return (
                <li
                  key={index}
                  className="flex items-center text-center rounded-full md:mx-2"
                >
                  <div>
                    <Image
                      width={120}
                      height={120}
                      className={`object-contain w-full h-full mx-auto ${customers!.items!.length < 5 ? 'max-h-64' : 'max-h-32'}`}
                      src={image}
                      alt={name}
                    />
                    {children}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {problemSection && (
        <section className="flex flex-col items-center content-center justify-center justify-items-center">
          <div className="flex flex-col justify-center">
            <div className="flex flex-col gap-4 text-center">
              <span className="text-3xl font-semibold text-brand-ui-primary">
                {problemSection?.title}
              </span>
              <span className="text-3xl font-bold text-black md:text-5xl ">
                {problemSection?.subtitle}
              </span>
            </div>
            <ul className="grid gap-8 my-10 md:grid-cols-3">
              {problemSection?.items?.map(({ image, description }, index) => {
                return (
                  <li key={index}>
                    <Image
                      width="400"
                      height="300"
                      alt="problem-image"
                      className="h-full mx-auto max-h-40 md:max-h-80"
                      src={image}
                    />
                    <p className="mt-8 text-sm">{description}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      )}

      <section className="flex flex-col items-center content-center justify-center justify-items-center">
        <h3 className="text-5xl font-semibold text-center md:w-2/3">
          {callToAction?.title}
        </h3>
        {callToAction?.subtitle && (
          <p className="mt-4 text-center md:w-1/2">{callToAction?.subtitle}</p>
        )}
        <ul className="flex flex-wrap justify-center gap-8 my-8">
          {features?.map(({ image, name, description }) => {
            return (
              <li
                key={name}
                className="flex flex-col items-center w-full md:w-1/4"
              >
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

      <section className="flex flex-col items-center content-center justify-center justify-items-center">
        {callToAction?.actions}
        <div className="text-xs text-center md:w-1/3">
          {callToAction?.description}
        </div>
      </section>

      {(faqs || [])?.length > 0 && (
        <section>
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
