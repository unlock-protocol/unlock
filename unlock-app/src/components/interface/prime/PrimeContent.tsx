'use client'

import { Button, Modal, Placeholder } from '@unlock-protocol/ui'
import { useQuery } from '@tanstack/react-query'
import { config } from '~/config/app'
import { useRouter } from 'next/navigation'
import { useUnlockPrime } from '~/hooks/useUnlockPrime'
import { usePrimeRefund } from '~/hooks/usePrimeRefund'
import { ethers } from 'ethers'
import dayjs from '../../../../src/utils/dayjs'
import { useEffect, useState } from 'react'
import { SiFarcaster, SiX } from 'react-icons/si'
import { useWeb3Service } from '~/utils/withWeb3Service'

export function ShareRefundModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}) {
  const router = useRouter()

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex flex-col justify-center gap-4 bg-white">
        <h1 className="text-3xl">Congratulations!</h1>
        <p>
          🍾 You&apos;ve claimed your reward. Share the news with your friends
          and followers.
        </p>
        <div className="flex gap-4 items-center">
          <Button
            iconLeft={<SiFarcaster />}
            className="basis-1 grow"
            onClick={() => {
              const castIntent = new URL('https://warpcast.com/~/compose')
              castIntent.searchParams.set(
                'text',
                'I just claimed my @unlock-protocol Prime ETH reward! Get a Prime Membership now and claim yours as well!\n\nhttps://app.unlock-protocol.com/prime'
              )
              router.push(castIntent.toString())
            }}
          >
            Share on Farcaster
          </Button>
          <Button
            iconLeft={<SiX />}
            className="basis-1 grow"
            onClick={() => {
              const tweetIntent = new URL('https://twitter.com/intent/tweet')
              tweetIntent.searchParams.set(
                'text',
                'I just claimed my @unlockProtocol Prime ETH reward! Get a Prime Membership now and claim yours as well!\n\n'
              )
              tweetIntent.searchParams.set(
                'url',
                'https://app.unlock-protocol.com/prime'
              )
              router.push(tweetIntent.toString())
            }}
          >
            Share on X
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export const ClaimableRefund = ({
  refund,
  claimRefund,
}: {
  refund: {
    timestamp: number
    amount: number
  }
  claimRefund: any
}) => {
  const refundDate = new Date(Number(refund.timestamp) * 1000)
  if (refundDate > new Date()) {
    return (
      <Button disabled={true} className="w-full">
        Claim {Number(ethers.formatEther(refund.amount)).toFixed(5)} ETH{' '}
        {dayjs(refundDate).fromNow()}
      </Button>
    )
  }
  return (
    <Button
      onClick={() => {
        claimRefund.mutate()
      }}
      className="w-full"
      loading={claimRefund.isPending}
    >
      Claim {Number(ethers.formatEther(refund.amount)).toFixed(4)} ETH
    </Button>
  )
}

export const PrimeContent = () => {
  const [isShareRefundModalOpen, setIsShareRefundModalOpen] = useState(false)
  const router = useRouter()
  const { joinPrime, isPrime } = useUnlockPrime()
  const { data: refund, claimRefund } = usePrimeRefund()
  const web3Service = useWeb3Service()

  const { data: lock } = useQuery({
    queryKey: ['prime'],
    queryFn: async () => {
      const lock = await web3Service.getLock(
        config.prime.contract,
        config.prime.network
      )
      return lock
    },
  })

  useEffect(() => {
    if (claimRefund.isSuccess) {
      setIsShareRefundModalOpen(true)
    }
  }, [claimRefund.isSuccess])

  return (
    <main className="flex flex-col gap-4 text-center md:w-3/4 mx-auto">
      <ShareRefundModal
        isOpen={isShareRefundModalOpen}
        setIsOpen={setIsShareRefundModalOpen}
      />
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
          <div className="m-2 w-full">
            {isPrime && refund && refund.amount > 0 ? (
              <ClaimableRefund claimRefund={claimRefund} refund={refund} />
            ) : (
              <Button
                className="w-full"
                disabled={isPrime}
                onClick={() => {
                  joinPrime()
                }}
              >
                {isPrime ? '💫 You are a Prime Member!' : 'Get Unlock Prime'}
              </Button>
            )}
          </div>
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
        † The ETH reward is currently 110% of your monthly payment, drawn from a
        pool of up to 10 ETH each month, available while supplies last.
      </small>
    </main>
  )
}

export default PrimeContent
