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
      <div className="grid max-w-6xl grid-cols-1 gap-8 pb-12 md:grid-cols-2 md:grid-rows-[auto]">
        {/* Left Column */}
        <div className="p-6 py-2 border rounded-lg bg-gray-50 h-[500px] md:h-[600px] lg:h-[650px] overflow-y-auto">
          <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:mb-3 prose-headings:text-gray-800 prose-p:mb-2 prose-p:text-gray-700 prose-li:mb-1 prose-li:text-gray-700 prose-a:text-blue-600 prose-a:font-medium prose-strong:font-semibold">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl font-bold mt-2 mb-3" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-bold mt-5 mb-3" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="pl-5 list-decimal space-y-1 my-3" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="pl-5 list-disc space-y-1 my-3" {...props} />
                ),
              }}
            >
              {terms}
            </ReactMarkdown>
          </div>
        </div>

        {/* Right Column - Claim Section */}
        <div className="p-6 border rounded-xl space-y-6 h-auto self-start">
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
