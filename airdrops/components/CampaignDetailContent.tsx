'use client'
import { StandardMerkleTree } from '@openzeppelin/merkle-tree'
import { AbiCoder, ethers } from 'ethers'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Container } from './layout/Container'
import {
  Select,
  Button,
  Checkbox,
  ToastHelper,
  AddressInput,
  isAddressOrEns,
  ToggleSwitch,
} from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { ConnectButton } from './auth/ConnectButton'
import { AirdropData } from './Campaigns'
import ReactMarkdown from 'react-markdown'
import { terms } from '../src/utils/terms'
import { UPAirdrops } from '@unlock-protocol/contracts'
import { useEligibility } from './hooks/useEligibility'
import { useDelegation } from './hooks/useDelegation'
import { minifyAddress } from '@unlock-protocol/ui'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'
import { communityStewards } from '../src/utils/stewards'

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

export const hasClaimed = async (
  address: string,
  amount: string,
  airdrop: AirdropData
) => {
  const airdropContract = await getContract(
    airdrop.contractAddress,
    airdrop.chainId
  )
  const campaignHash = ethers.keccak256(ethers.toUtf8Bytes(airdrop.name))

  const abiCoder = new AbiCoder()

  // Encode and hash the data
  const encoded = abiCoder.encode(['address', 'uint256'], [address, amount])
  const leaf = ethers.keccak256(ethers.keccak256(encoded))

  const wasClaimed = await airdropContract.claimedLeafs(campaignHash, leaf)

  return wasClaimed
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
  const [delegating, setDelegating] = useState(false)
  const [isSelfDelegate, setIsSelfDelegate] = useState(false)
  const [useCustomAddress, setUseCustomAddress] = useState(false)
  const [delegateAddress, setDelegateAddress] = useState('')
  const [delegateAddressError, setDelegateAddressError] = useState(false)

  useEffect(() => {
    setTermsOfServiceSignature('')
  }, [wallets[0]?.address])

  const {
    data: { eligible, claimed },
    refetch,
  } = useEligibility(airdrop)

  const {
    data: { hasDelegated },
    refetch: refetchDelegation,
  } = useDelegation(airdrop)

  const eligibleFormatted = eligible
    ? ethers.formatUnits(eligible, airdrop.token?.decimals)
    : ''

  const onResolveName = async (address: string) => {
    if (address.length === 0) return null
    try {
      const web3Service = new Web3Service(networks)
      const result = await web3Service.resolveName(address)
      if (result) {
        setDelegateAddress(result?.address)
        setDelegateAddressError(false)
      } else {
        setDelegateAddressError(true)
      }
      return result
    } catch (error) {
      console.error('Error resolving ENS name:', error)
      setDelegateAddressError(true)
      return null
    }
  }

  const handleAddressChange = (value: any) => {
    setDelegateAddress(value ?? '')
    setDelegateAddressError(!value)
  }

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

  const onDelegate = async () => {
    try {
      setDelegating(true)
      const provider = await wallets[0].getEthereumProvider()
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()

      await wallets[0].switchChain(airdrop.chainId)

      const tokenAbi = ['function delegate(address delegatee) external']
      const tokenContract = new ethers.Contract(
        airdrop.token.address,
        tokenAbi,
        signer
      )
      const delegatee = isSelfDelegate ? wallets[0].address : delegateAddress

      if (!ethers.isAddress(delegatee)) {
        throw new Error('Invalid delegate address')
      }

      const delegatePromise = async () => {
        const tx = await tokenContract.delegate(delegatee)
        await tx.wait()
        await refetchDelegation()
        return
      }

      await ToastHelper.promise(delegatePromise(), {
        loading: 'Delegating your tokens...',
        success: `Successfully delegated voting power to ${isSelfDelegate ? 'yourself' : delegatee}!`,
        error: 'Failed to delegate tokens. Please try again.',
      })
    } catch (error) {
      console.error(error)
    } finally {
      setDelegating(false)
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
            eligible,
            proof,
            termsOfServiceSignature
          )
        tx.wait()
        await refetch()
        return
      }

      // provide feedback to user
      await ToastHelper.promise(claimPromise(), {
        loading: 'Processing your claim transaction...',
        success: `Successfully claimed ${Number(eligibleFormatted).toLocaleString()} UP tokens!`,
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
        <h1 className="text-3xl lg:text-4xl font-bold">{airdrop.name}</h1>
        <p className="text-lg lg:text-xl text-gray-600">
          {airdrop.description}
        </p>
      </div>

      {/* Two-column layout for remaining content */}
      <div className="grid max-w-6xl grid-cols-1 gap-8 pb-12 md:grid-cols-2 md:grid-rows-[auto]">
        {/* Left Column */}
        <div className="relative p-6 py-2 border rounded-lg bg-gray-50 h-[500px] md:h-[600px] lg:h-[650px] overflow-y-auto">
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
          <h2 className="text-xl lg:text-2xl font-bold">Claim Your Rewards</h2>

          {authenticated ? (
            <div className="space-y-6">
              {Number(eligibleFormatted) > 0 ? (
                <>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-medium mb-2">Status</h3>
                    <p className="text-green-600 font-medium">
                      Eligible to Claim{' '}
                      {Number(eligibleFormatted).toLocaleString()} UP
                    </p>
                  </div>

                  {!claimed ? (
                    <>
                      {!hasDelegated && (
                        <div className="p-4 mb-4 border rounded-lg bg-yellow-50 border-yellow-200">
                          <p className="mb-4 text-yellow-800">
                            Before claiming your tokens, you need to delegate
                            your voting power. This helps secure the protocol by
                            allowing you to participate in governance.
                          </p>

                          {/* delegation UI with ToggleSwitch */}
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Delegate to yourself
                              </span>
                              <ToggleSwitch
                                enabled={isSelfDelegate}
                                setEnabled={setIsSelfDelegate}
                              />
                            </div>

                            {!isSelfDelegate && (
                              <div className="mt-4 space-y-4">
                                {!useCustomAddress ? (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Select Community Steward
                                    </label>
                                    <Select
                                      options={[
                                        ...communityStewards.map((steward) => ({
                                          label: `${steward.name} - ${minifyAddress(steward.address)}`,
                                          value: steward.address,
                                        })),
                                      ]}
                                      onChange={handleAddressChange}
                                      defaultValue={{
                                        label: 'Select a community steward',
                                        value: '',
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Enter address or ENS name
                                    </label>
                                    <div className="relative">
                                      <AddressInput
                                        withIcon
                                        value={delegateAddress}
                                        onChange={handleAddressChange}
                                        placeholder="address.eth or 0x..."
                                        onResolveName={onResolveName}
                                        disabled={delegating}
                                      />
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">
                                    Use custom address
                                  </span>
                                  <ToggleSwitch
                                    enabled={useCustomAddress}
                                    setEnabled={setUseCustomAddress}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <Button
                            className="mt-4"
                            onClick={onDelegate}
                            loading={delegating}
                            disabled={
                              delegating ||
                              (!isSelfDelegate &&
                                (!delegateAddress ||
                                  !isAddressOrEns(delegateAddress) ||
                                  delegateAddressError))
                            }
                          >
                            Delegate Voting Power
                          </Button>
                        </div>
                      )}

                      {hasDelegated && (
                        <div className="p-4 mb-4 border rounded-lg bg-green-50 border-green-200">
                          <p className="text-green-800">
                            ✅ You have delegated your voting power. You can now
                            claim your tokens.
                          </p>
                        </div>
                      )}

                      <Checkbox
                        label="I have read and agree to the Airdrop Terms and Conditions"
                        checked={!!termsOfServiceSignature}
                        onChange={onBoxChecked}
                        disabled={!hasDelegated}
                      />
                      <Button
                        disabled={!termsOfServiceSignature || !hasDelegated}
                        onClick={onClaim}
                      >
                        Claim Tokens
                      </Button>
                    </>
                  ) : (
                    <p className="text-gray-500 font-medium">
                      👏 Congrats! You have claimed your UP tokens!
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 font-medium">
                  You are not eligible for this airdrop.
                </p>
              )}
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
