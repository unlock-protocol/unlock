'use client'

import { Button, Placeholder } from '@unlock-protocol/ui'
import { useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { useRouter } from 'next/navigation'
import { useUnlockPrime } from '~/hooks/useUnlockPrime'

export const PrimeContent = () => {
  const router = useRouter()
  const { joinPrime, isPrime } = useUnlockPrime()

  const { data: lock } = useQuery({
    queryKey: ['prime'],
    queryFn: async () => {
      const web3Service = new Web3Service(networks)
      const lock = await web3Service.getLock(
        config.prime.contract,
        config.prime.network
      )
      return lock
    },
  })

  return (
    <main className="flex flex-col gap-4 text-center md:w-3/4 mx-auto">
      <h1
        className="text-5xl font-extrabold text-transparent uppercase md:text-7xl bg-clip-text"
        style={{
          backgroundImage:
            'linear-gradient(85.7deg, #603DEB 3.25%, #F19077 90.24%)',
        }}
      >
        Unlock Prime
      </h1>
      <p className="text-2xl">
        You can use Unlock Labs basic tools for free. Upgrade to Unlock Prime
        and get monthly ETH rewards, enhanced features, and a stack of other
        benefits.
      </p>
      <section className="flex mt-8 md:mt-8 gap-8 md:justify-center items-center md:items-stretch flex-col md:flex-row">
        <div className="w-96 flex flex-col gap-2 border p-4 rounded-lg bg-white">
          <h2 className="text-3xl font-semibold">Unlock Basic</h2>
          <h3 className="">Free</h3>
          <Button
            className="m-2"
            onClick={() => {
              router.push('/')
            }}
          >
            Get Started
          </Button>
          <ul className="flex flex-col pl-4 text-left gap-2">
            <li>
              <h4 className="text-lg font-semibold">
                Bring your experiences onchain
              </h4>
            </li>
            <li>
              <ul className="flex flex-col pl-4 text-left gap-2">
                <li>Accept onchain payments</li>
                <li>Accept credit card payments</li>
                <li>
                  Available on Base, Arbitrum, Polygon, and other networks
                </li>
              </ul>
            </li>

            <li>
              <h4 className="text-lg font-semibold">Events</h4>
            </li>
            <li>
              <ul className="flex flex-col pl-4 text-left gap-2">
                <li>Event landing page</li>
                <li>Free and paid event ticketing</li>
                <li>RSVP application approvals</li>
                <li>Proof-of-attendance tokens</li>
                <li>Customizable ticket designs</li>
                <li>Support for up to 5 events</li>
              </ul>
            </li>
          </ul>
        </div>
        <div className="w-96 flex flex-col gap-2 border p-4 rounded-lg bg-white">
          <h2 className="text-3xl font-semibold">Unlock Prime</h2>
          <h3 className="">
            {!lock ? (
              <Placeholder.Root>
                <Placeholder.Line size="md" />
              </Placeholder.Root>
            ) : (
              `${lock?.keyPrice} ${lock?.currencySymbol}/mo (~$6)`
            )}
          </h3>
          <Button
            disabled={isPrime}
            className="m-2"
            onClick={() => {
              joinPrime()
            }}
          >
            {isPrime ? '💫 You are a Prime Member!' : 'Get Unlock Prime'}
          </Button>
          <ul className="flex flex-col pl-4 text-left gap-2">
            <li>
              <h4 className="text-lg font-semibold">
                Everything in Basic, plus...
              </h4>
            </li>
            <li>
              <ul className="flex flex-col pl-4 text-left gap-2">
                <li>Monthly ETH rewards†</li>
                <li>Unlimited airdrops</li>
                <li>Exclusive partner discounts</li>
                <li>Swag</li>
                <li>Cancel anytime</li>
              </ul>
            </li>
            <li>
              <h4 className="text-lg font-semibold">Events</h4>
            </li>
            <li>
              <ul className="flex flex-col pl-4 text-left gap-2">
                <li>Unlimited events</li>
                <li>Multiple event template layouts</li>
                <li>Attendee check-in</li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
      <small>
        † ETH reward currently 110% of what you paid that month, while supplies
        last.
      </small>
    </main>
  )
}

export default PrimeContent
