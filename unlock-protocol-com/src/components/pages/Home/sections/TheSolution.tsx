import React from 'react'

interface SolutionProps {
  image: string
  heading: string
  title: string
  description: string
}

const SOLUTIONS: SolutionProps[] = [
  {
    image: '/images/illustrations/img-clock.svg',
    heading: 'Expirations and Renewals',
    title: 'Add time constraints to your smart contracts',
    description: `Other smart contracts don't address the "time" element of membership. Unlock Protocol smart contracts allow you to easily manage membership state, including expirations and renewals.`,
  },
  {
    image: '/images/illustrations/img-wallet.svg',
    heading: 'Recurring Payments',
    title: 'Handle recurring payments onchain',
    description: `With built-in functions to check current membership status, trigger renewals, and manage membership state, you can build subscription programs using smart contracts — without having to stitch together a bunch of workarounds.`,
  },
  {
    image: '/images/illustrations/img-goodvibe.svg',
    heading: 'Easy onboarding for customers',
    title: 'Familiar onboarding experiences',
    description: `With features like email-based memberships, walletless airdrops, and seamless integration with Apple Wallet and Google Wallet, your users will be up and using your system in no time, without having to learn (or care about!) tech-speak jargon.`,
  },
]

export default function TheSolution() {
  return (
    <div className="grid gap-24">
      <div className="flex flex-col items-start gap-6">
        <span className="text-5xl font-bold text-black md:text-7xl">{`We've solved the membership problem for smart contracts`}</span>
        <span className="px-10 py-6 bg-[#E1DAFF] font-bold text-gray-900 text-4xl md:w-2/3 w-full rounded-lg">
          Unlock is the only smart contract protocol specifically built for
          memberships
        </span>
      </div>
      <div className="grid gap-20">
        {SOLUTIONS?.map((solution, index) => {
          const inverse = index % 2 !== 0

          const classRow = inverse
            ? 'flex flex-col md:flex-row-reverse'
            : 'flex flex-col md:flex-row'
          return (
            <div className={`${classRow} gap-6`} key={index}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <span className="text-xl font-bold text-brand-ui-primary">
                    {solution?.heading}
                  </span>
                  <span className="text-5xl font-bold text-black ">
                    {solution?.title}
                  </span>
                </div>
                <span className="text-xl text-gray-700">
                  {solution?.description}
                </span>
              </div>
              <img src={solution.image} alt="" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
