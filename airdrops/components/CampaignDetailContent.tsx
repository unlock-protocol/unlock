'use client'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { ethers } from 'ethers'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Container } from './layout/Container'
import { Button, Checkbox, ToastHelper } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { ConnectButton } from './auth/ConnectButton'
import { isEligible } from '../src/utils/eligibility'
import { AirdropData } from './Campaigns'
import ReactMarkdown from 'react-markdown'
import { terms } from '../src/utils/terms'
import { UPAirdrops } from '@unlock-protocol/contracts'

interface CampaignDetailContentProps {
  airdrop: AirdropData
}

const timestamp = new Date().getTime()

const getContract = async (address: string, network: number) => {
  const provider = new ethers.JsonRpcProvider(
    `https://rpc.unlock-protocol.com/${network}`
  )
  return new ethers.Contract(address, UPAirdrops.abi, provider)
}

const getProof = async (address: string, airdrop: AirdropData) => {
  const request = await fetch(airdrop.recipientsFile)
  const tree = StandardMerkleTree.load(await request.json())
  for (const [i, leaf] of tree.entries()) {
    if (leaf[0].toLowerCase() === address.toLowerCase()) {
      const proof = tree.getProof(i)
      return { leaf, proof }
    }
  }
  return { leaf: null, proof: null }
}

export default function CampaignDetailContent({
  airdrop,
}: CampaignDetailContentProps) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [termsOfServiceSignature, setTermsOfServiceSignature] = useState('')

  useEffect(() => {
    const run = async () => {
      if (wallets[0]) {
        const amount = await isEligible(wallets[0].address, airdrop)
        airdrop.eligible = amount || 0
      }
    }
    run()
  }, [authenticated, wallets, airdrop])

  const onBoxChecked = async () => {
    if (!termsOfServiceSignature) {
      const provider = await wallets[0].getEthereumProvider()
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()

      await wallets[0].switchChain(airdrop.chainId)
      const contract = await getContract(
        airdrop.contractAddress,
        airdrop.chainId
      )

      const domain = {
        name: await contract.EIP712Name(),
        version: await contract.EIP712Version(),
        chainId: airdrop.chainId,
        verifyingContract: airdrop.contractAddress,
      }

      const types = {
        TosSignature: [
          { name: 'signer', type: 'address' },
          { name: 'campaignName', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
        ],
      }

      const value = {
        signer: signer.address,
        campaignName: airdrop.name,
        timestamp,
      }

      const signature = await signer.signTypedData(domain, types, value)
      setTermsOfServiceSignature(signature)
    } else {
      setTermsOfServiceSignature('')
    }
  }

  const onClaim = async () => {
    try {
      const provider = await wallets[0].getEthereumProvider()
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()

      const airdropContract = await getContract(
        airdrop.contractAddress,
        airdrop.chainId
      )

      // Get the proof!
      const { proof } = await getProof(wallets[0].address, airdrop)
      console.log(proof)

      // Create the transaction promise
      const claimPromise = async () => {
        const tx = await airdropContract
          .connect(signer)
          // @ts-expect-error Property 'claim' does not exist on type 'BaseContract'.ts(2339)
          .claim(
            airdrop.name,
            timestamp,
            wallets[0].address,
            airdrop.eligible,
            proof,
            termsOfServiceSignature
          )
        return tx.wait()
      }

      // provide feedback to user
      await ToastHelper.promise(claimPromise(), {
        loading: 'Processing your claim transaction...',
        success: `Successfully claimed ${airdrop.eligible} UP tokens!`,
        error: 'Failed to claim tokens. Please try again.',
      })
    } catch (error) {
      console.error(error)
      ToastHelper.error(
        'There was an unexpected issue with the claim process. Please try again.'
      )
    }
  }

  return (
    <Container>
      <Button variant="borderless" aria-label="arrow back" className="my-5">
        <Link href="/">
          <ArrowBackIcon size={20} className="cursor-pointer" />
        </Link>
      </Button>

      {/* Full-width title and description */}
      <div className="max-w-6xl space-y-4 mb-8">
        <h1 className="text-4xl font-bold">{airdrop.name}</h1>
        <p className="text-xl text-gray-600">{airdrop.description}</p>
      </div>

      {/* Two-column layout for remaining content */}
      <div className="grid max-w-6xl grid-cols-1 gap-8 pb-12 md:grid-cols-2">
        {/* Left Column */}
        <div className="p-4 border rounded-lg bg-gray-50 text-sm h-80 overflow-y-auto prose lg:prose-xl">
          <ReactMarkdown children={terms} />
        </div>

        {/* Right Column - Claim Section */}
        <div className="p-6 border rounded-xl space-y-6">
          <h2 className="text-2xl font-semibold">Claim Your Rewards</h2>

          {authenticated ? (
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-2">Status</h3>
                <p className="text-green-600 font-medium">
                  Eligible to Claim {airdrop.eligible} UP
                </p>
              </div>

              <Checkbox
                label="I have read and agree to the Airdrop Terms and Conditions"
                checked={!!termsOfServiceSignature}
                onChange={onBoxChecked}
              />

              <Button disabled={!termsOfServiceSignature} onClick={onClaim}>
                Claim Tokens
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Please connect your wallet to claim this airdrop.
              </p>
              <ConnectButton />
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}
