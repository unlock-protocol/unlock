import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'

import {
  AnimationContent,
  DeployStatus,
} from '~/components/interface/locks/Create/elements/CreateLockFormSummary'
import { useConfig } from '~/utils/withConfig'
import { useEffect } from 'react'
import { TransactionDetails } from './NewCertification'
import { useTransferFee } from '~/hooks/useTransferFee'
import { useMutation } from '@tanstack/react-query'
import { getCertificationPath } from './utils'

interface LockDeployingProps {
  transactionDetails: TransactionDetails
  lockAddress?: string
  slug?: string
}

export const CertificationDeploying = ({
  transactionDetails,
  lockAddress,
  slug,
}: LockDeployingProps) => {
  const config = useConfig()
  const router = useRouter()
  const { hash: transactionHash, network } = transactionDetails

  let status: DeployStatus = 'progress'
  let title = 'Waiting for your transaction to be mined'
  let message = 'Please do not close this window'

  const { updateTransferFee } = useTransferFee({
    lockAddress: lockAddress!,
    network,
  })

  const updateTransferFeeMutation = useMutation(updateTransferFee)

  useEffect(() => {
    window?.scrollTo(0, 0) // force scroll start of page
  }, [])

  if (lockAddress) {
    status = 'deployed'
    title = '🚀​ Your contract was successfully deployed'
    message = `Did you know that you can airdrop certifications by email, even if you don't know the recipient's wallet address?`
  }

  const goToCertification = () => {
    if (!lockAddress) return
    router.push(
      getCertificationPath({
        metadata: {
          slug,
        },
        lockAddress,
        network,
      })
    )
  }

  return (
    <div>
      <div className="flex flex-col items-stretch p-4 border border-gray-400 rounded-xl">
        <AnimationContent status={status} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-base">Status</span>
            <span className="text-lg font-bold">
              {status === 'progress' ? 'In progress...' : 'Deployed'}
            </span>
          </div>
          {config.networks[network].explorer?.urls?.transaction && (
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-3 text-lg font-bold lg:mt-auto lg:ml-auto text-brand-ui-primary"
              href={config.networks[network].explorer.urls.transaction(
                transactionHash
              )}
            >
              View on block explorer
              <ExternalLinkIcon size={20} />
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center my-12 text-center">
        <h3 className="block mb-4 text-2xl font-bold md:text-4xl">{title}</h3>
        <span className="mb-4 font-base">{message}</span>
        {status === 'deployed' && lockAddress && (
          <div className="flex flex-col items-center content-center text-center">
            {!updateTransferFeeMutation.isLoading ? (
              <>
                <p>
                  {`We're almost there, but it's essential to make sure your
                  certification is not transferable.`}
                </p>
                <Button
                  className="my-4"
                  disabled={updateTransferFeeMutation.isLoading}
                  loading={updateTransferFeeMutation.isLoading}
                  onClick={() => {
                    updateTransferFeeMutation.mutateAsync(100) // Make tokens non-transferable
                  }}
                >
                  Make tokens non-transferable
                </Button>
              </>
            ) : (
              <>
                <p>We have also built a page for you!</p>
                <Button className="my-4" onClick={goToCertification}>
                  View certification page
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
