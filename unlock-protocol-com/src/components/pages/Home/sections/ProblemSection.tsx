import React from 'react'
import Image from 'next/image'

const PROBLEMS = [
  {
    image: '/images/illustrations/img-stuck.svg',
    description:
      "You've tried using digital collectible NFTs for memberships — and realized you needed to keep launching new projects in order to keep revenue flowing.",
  },
  {
    image: '/images/illustrations/img-cal.svg',
    description:
      "You've tried to build a way to handle recurring subscriptions or time-specific memberships — but your existing smart contract can't support renewals, expirations, or managing membership status over time.",
  },
  {
    image: '/images/illustrations/img-fly.svg',
    description:
      "You want to get memberships to users easily, using things they are familiar with like email, airdrops, Apple and Google wallets — but can't find a way to do so.",
  },
]

export default function ProblemSection() {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-col gap-4 text-center">
        <span className="text-3xl font-semibold text-brand-ui-primary">
          The Problem
        </span>
        <span className="text-3xl font-bold text-black md:text-5xl ">
          Other smart contracts were not built to handle memberships or
          subscriptions
        </span>
      </div>
      <ul className="grid gap-8 my-8 md:grid-cols-3">
        {PROBLEMS?.map(({ image, description }, index) => {
          return (
            <li className="flex flex-col gap-8" key={index}>
              <Image
                className="mx-auto"
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
  )
}
