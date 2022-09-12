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
  title: string
  description: string
  status: string
}

const StatusLabel = ({
  active = false,
  label,
  description,
  variant = 'default',
}: StatusProps) => {
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
    title: 'This will take few minutes...',
    description: 'Feel free to wait in this screen or return to main page.',
    status: 'Progressing...',
  },
  deployed: {
    title: '🚀​ Lock is successfully deployed',
    description: 'Redirecting you back to main page...',
    status: 'Completed!',
  },
  txError: {
    title: 'Something went wrong...',
    description: 'Please try again.',
    status: 'Not completed.',
  },
}

export const CreateLockFormSummary = ({
  formData,
  network,
  showStatus = false,
  transactionHash,
}: CreateLockFormSummaryProps) => {
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

  const currentStatus: DeployStatus = isError
    ? 'txError'
    : isDeployed
    ? 'deployed'
    : 'progress'

  const { title, description, status } = DEPLOY_STATUS_MAPPING[currentStatus]

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
        {showStatus && (
          <div className="px-8 py-10 ">
            <div data-testid="status" className="flex flex-col gap-8 r">
              {isDeploying && (
                <img
                  className="object-contain animate-pulse max-h-96"
                  src="/images/svg/create-lock/deploying.svg"
                  alt="Deploying"
                />
              )}
              {isDeployed && (
                <img
                  className="object-contain max-h-96"
                  src="/images/svg/create-lock/deployed.svg"
                  alt="Deploying"
                />
              )}
              {/** todo: replace with error image when available */}
              {isError && (
                <img
                  className="object-contain animate-pulse max-h-96"
                  src="/images/svg/create-lock/deploying.svg"
                  alt="Error"
                />
              )}
            </div>
            <div className="grid grid-cols-2">
              <div className="flex flex-col">
                <span className="text-base">Status</span>
                <span className="text-lg font-bold">{status}</span>
              </div>
              {transactionDetailUrl && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 mt-5 ml-auto text-lg font-bold text-brand-ui-primary"
                  href={transactionDetailUrl}
                >
                  <span>See on Etherscan</span>
                  <ExternalLinkIcon size={20} />
                </a>
              )}
            </div>
          </div>
        )}
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
            <KeyPrice price={formData?.keyPrice} symbol={baseCurrencySymbol} />
          </div>
        </div>
      </div>
      {showStatus && (
        <div className="flex flex-col items-center mt-12">
          <h3 className="block mb-4 text-4xl font-bold">{title}</h3>
          <span className="mb-4 font-base">{description}</span>
          <Link href={'/dashboard'}>
            <Button className="w-full max-w-lg" variant="outlined-primary">
              Return to Lock list
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
