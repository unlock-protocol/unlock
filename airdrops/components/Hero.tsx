'use client'

import { Container } from './layout/Container'
import { usePrivy } from '@privy-io/react-auth'
import { ConnectButton } from './auth/ConnectButton'

export default function Hero() {
  const { authenticated } = usePrivy()

  return (
    <div className="h-[50vh] flex items-center">
      <Container>
        <div className="flex flex-col items-center justify-center">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Claim Your Rewards</h1>
            <p className="text-xl text-gray-600 mb-6">
              Participate in our ecosystem rewards program and claim UP tokens.
              Connect your wallet to check your eligibility for various
              airdrops.
            </p>
            <div className="flex gap-4 justify-center">
              {!authenticated && <ConnectButton />}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
