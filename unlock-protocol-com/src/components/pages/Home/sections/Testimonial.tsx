import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import Container from 'src/components/layout/Container'

interface TestimonialBoxProps {
  description: string
  project: string
  name: string
  profilePicture: string
}

const TESTIMONIALS: TestimonialBoxProps[] = [
  {
    name: 'Mareen Glaske',
    project: 'DappCon',
    description:
      'It was a no-brainer for us to ticket DappCon with an onchain solution using Unlock Protocol. We wanted to bring blockchain technology forward, and setting up ticketing for DappCon was done in under two weeks.',
    profilePicture: '/images/profile/MareenGlaske.png',
  },
  {
    name: 'Ciara Nightingale',
    project: 'thirdweb',
    description:
      'There are so many use cases such as token gating, time-based memberships, recurring memberships — the opportunities are endless. Unlock Protocol is an awesome tool.',
    profilePicture: '/images/profile/CiaraNightingale.png',
  },
  {
    name: 'Luke Barwikowski',
    project: 'Pixels Online',
    description:
      'We were able to build and launch our membership feature with just one developer in 2 weeks.',
    profilePicture: '/images/profile/LukeBarwikowski.png',
  },
  {
    name: 'Ben Turtel',
    project: 'Kazm',
    description:
      "The combination of Unlock Protocol and Kazm's member management will make it easy to deliver web3-enabled experiences to existing audiences.",
    profilePicture: '/images/profile/BenTurtol.png',
  },
  {
    name: 'Adam Blumberg',
    project: 'PlannerDAO',
    description:
      'The CDAA certification, powered by Unlock, is our biggest opportunity to grow participation in the community and bring power back to the financial planners on the front lines working with clients.',
    profilePicture: '/images/profile/AdamBlumberg.png',
  },
  {
    name: 'Kyle Reidhead',
    project: 'Web3 Academy',
    description:
      'Unlock is serving as the technical connector piece between the membership NFTs we issue to our users and the backend membership requirements. This is what the future looks like.',
    profilePicture: '/images/profile/KyleReidhead.png',
  },
]

function TestimonialBox({
  name,
  description,
  project,
  profilePicture,
}: TestimonialBoxProps) {
  return (
    <div className="bg-white relative flex flex-col overflow-hidden min-w-[80vw] md:min-w-[30vw] group rounded-3xl p-6 gap-4">
      <div className="mb-2 text-lg text-gray-600">{description}</div>
      <div className="flex object-cover gap-4 mt-auto">
        <Image
          width={64}
          height={64}
          className="object-cover w-16 h-16 rounded-full"
          src={profilePicture}
          alt="profile picture"
        />
        <div className="flex flex-col gap-2">
          <h4 className="text-xl font-bold text-brand-ui-primary">{project}</h4>
          <span className="text-xl text-black"> {name} </span>
        </div>
      </div>
    </div>
  )
}

export default function Testimonial() {
  const [viewportRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    loop: false,
  })

  return (
    <div className="flex flex-col gap-10">
      <Container>
        <div className="flex w-full text-center">
          <span className="mx-auto text-3xl font-bold text-center md:text-5xl">
            Bring flexibility and transparency into your membership products
          </span>
        </div>
      </Container>
      <div
        className="w-full overflow-hidden cursor-move sm:block"
        ref={viewportRef}
      >
        <div className="flex gap-8 ml-4 select-none">
          {TESTIMONIALS?.map((testimonial, index) => {
            return <TestimonialBox key={index} {...testimonial} />
          })}
        </div>
      </div>
    </div>
  )
}
