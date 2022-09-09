import { Button } from '@unlock-protocol/ui'
import { useConfig } from '~/utils/withConfig'
import { LockFormProps } from './CreateLockForm'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import Link from 'next/link'
import { useEffect } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { KeyPrice } from './KeyPrice'

type Variant = 'default' | 'red'
interface StatusProps {
  active: boolean
  label: string
  description?: string
  variant?: Variant
}

interface DeployStatusProps {
  label: string
  description: string
}

const StatusLabel: React.FC<StatusProps> = ({
  active = false,
  label,
  description,
  variant = 'default',
}) => {
  const VARIANTS_STYLES: Record<Variant, string> = {
    default: 'text-black',
    red: 'text-red-700',
  }

  return (
    <div className={active ? VARIANTS_STYLES[variant] : 'text-gray-300'}>
      <span className="block text-4xl font-bold">{label}</span>
      {description && <span className="mt-2 text-base">{description}</span>}
    </div>
  )
}

interface CreateLockFormSummaryProps {
  formData: LockFormProps
  network: number
  showStatus?: boolean
  transactionHash?: string
}

type DeployStatus = 'progress' | 'deployed' | 'txError'
const DEPLOY_STATUS_MAPPING: Record<DeployStatus, DeployStatusProps> = {
  progress: {
    label: 'This will take few minutes...',
    description: 'Feel free to wait in this screen or return to main page.',
  },
  deployed: {
    label: '🚀​ Lock is successfully deployed',
    description: 'Redirecting you back to main page...',
  },
  txError: {
    label: 'Something went wrong...',
    description: 'Please try again.',
  },
}

export const CreateLockFormSummary: React.FC<CreateLockFormSummaryProps> = ({
  formData,
  network,
  showStatus = false,
  transactionHash,
}) => {
  const router = useRouter()
  const web3Service = useWeb3Service()
  const { networks, requiredConfirmations } = useConfig()
  const { unlimitedDuration = false, unlimitedQuantity = false } =
    formData ?? {}

  const {
    name: networkName,
    explorer,
    baseCurrencySymbol,
  } = networks[network!] ?? {}

  const transactionDetailUrl = transactionHash
    ? explorer?.urls?.transaction(transactionHash)
    : null

  const getTransactionDetails = async (hash: string) => {
    return await web3Service.getTransaction(hash, network!)
  }

  const { data: { confirmations = 0 } = {}, isError } = useQuery(
    ['getTransactionDetails'],
    () => {
      if (transactionHash) {
        return getTransactionDetails(transactionHash!)
      }
    },
    {
      refetchInterval: 5000,
    }
  )

  const isDeploying = confirmations < requiredConfirmations && !isError
  const isDeployed = confirmations >= requiredConfirmations && !isError

  const status: DeployStatus = isError
    ? 'txError'
    : isDeployed
    ? 'deployed'
    : 'progress'

  const { label, description } = DEPLOY_STATUS_MAPPING[status]

  useEffect(() => {
    // redirect to dashboard after the key is deployed
    if (isDeployed) {
      setTimeout(() => {
        router.push('/dashboard')
      }, 5000)
    }
  }, [isDeployed, router])

  return (
    <div>
      <div
        className={`${
          showStatus ? 'grid-cols-2' : 'grid-cols-1'
        } grid border border-gray-400 divide-x divide-gray-400 rounded-xl`}
      >
        <div data-testid="summary" className="flex flex-col gap-8 px-8 py-10">
          <div className="flex flex-col gap-2">
            <span className="text-base">Network</span>
            <span className="text-xl font-bold">{networkName}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base">Name</span>
            <span className="text-xl font-bold">{formData?.name}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base">Duration</span>
            <span className="text-xl font-bold">
              {unlimitedDuration ? 'Unlimited' : formData?.expirationDuration}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base">Quantity</span>
            <span className="text-xl font-bold">
              {unlimitedQuantity ? 'Unlimited' : formData?.maxNumberOfKeys}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-base">Currency & Price</span>
            <KeyPrice
              price={formData?.keyPrice}
              currency={baseCurrencySymbol}
            />
          </div>
        </div>
        {showStatus && (
          <div className="px-8 py-10 ">
            <div data-testid="status" className="flex flex-col gap-8">
              <StatusLabel
                label="Deploying..."
                description={`Block ${confirmations}/${requiredConfirmations} confirmed.`}
                active={isDeploying}
              />
              <StatusLabel label="Deployed." active={isDeployed} />
              {isError && (
                <StatusLabel
                  label="Failed..."
                  description="TX failed."
                  active={isError}
                  variant="red"
                />
              )}
            </div>
            {transactionDetailUrl && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 mt-20 text-lg font-bold text-brand-ui-primary"
                href={transactionDetailUrl}
              >
                <span>See on Etherscan</span>
                <ExternalLinkIcon size={20} />
              </a>
            )}
          </div>
        )}
      </div>
      {showStatus && (
        <div className="flex flex-col items-center mt-12">
          <h3 className="block mb-4 text-4xl font-bold">{label}</h3>
          <span className="mb-4 font-base">{description}</span>
          <Link href={'/dashboard'}>
            <Button className="w-full max-w-lg" variant="outlined-primary">
              Return to main
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
