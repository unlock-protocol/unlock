import { Button } from '@unlock-protocol/ui'
import { useConfig } from '~/utils/withConfig'
import { LockFormProps } from './CreateLockForm'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import Link from 'next/link'
import { useEffect } from 'react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from 'react-query'
import { useRouter } from 'next/router'
import { KeyPrice } from '../../elements/KeyPrice'
import Lottie from 'lottie-react'
import deployedAnimation from '~/animations/deployed.json'
import deployingAnimation from '~/animations/deploying.json'
import deployErrorAnimation from '~/animations/deploy-error.json'
import { durationsAsTextFromSeconds } from '~/utils/durations'
import { ONE_DAY_IN_SECONDS } from '~/constants'

interface DeployStatusProps {
  title: string
  description: string
  status: string
  backText: string
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
    description: 'Feel free to wait here or return to main page.',
    status: 'In progress...',
    backText: 'Return to Lock list',
  },
  deployed: {
    title: '🚀​ Lock has successfully been deployed',
    description: 'Redirecting you back to main page...',
    status: 'Completed!',
    backText: 'Return to Lock list',
  },
  txError: {
    title: 'Something went wrong...',
    description: 'Please try again.',
    status: 'Not completed.',
    backText: 'Close',
  },
}

function AnimationContent({ status }: { status: DeployStatus }) {
  const animationClass = `h-60 md:h-96`
  switch (status) {
    case 'progress':
      return (
        <Lottie className={animationClass} animationData={deployingAnimation} />
      )
    case 'deployed':
      return (
        <Lottie
          className={animationClass}
          animationData={deployedAnimation}
          loop={false}
        />
      )
    case 'txError': {
      return (
        <Lottie
          className={animationClass}
          animationData={deployErrorAnimation}
          loop={false}
        />
      )
    }
    default:
      return null
  }
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
  const {
    unlimitedDuration = false,
    unlimitedQuantity = false,
    network: lockNetwork,
  } = formData ?? {}

  // when lock is deploying use form network to avoid error when user switch network
  const defaultNetwork = showStatus ? lockNetwork : network

  const {
    name: networkName,
    explorer,
    baseCurrencySymbol,
  } = networks[defaultNetwork!] ?? {}

  const transactionDetailUrl = transactionHash
    ? explorer?.urls?.transaction(transactionHash)
    : null

  const getTransactionDetails = async (hash: string) => {
    return await web3Service.getTransaction(hash, defaultNetwork)
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

  const isDeployed = confirmations >= requiredConfirmations && !isError

  const currentStatus: DeployStatus = isError
    ? 'txError'
    : isDeployed
    ? 'deployed'
    : 'progress'

  const { title, description, status, backText } =
    DEPLOY_STATUS_MAPPING[currentStatus]
  const symbol = formData?.symbol || baseCurrencySymbol

  useEffect(() => {
    // redirect to dashboard after the key is deployed
    if (isDeployed) {
      setTimeout(() => {
        router.push('/dashboard')
      }, 5000)
    }
  }, [isDeployed, router])

  const durationAsText = formData?.expirationDuration
    ? durationsAsTextFromSeconds(
        formData.expirationDuration * ONE_DAY_IN_SECONDS
      )
    : null

  return (
    <div>
      <div className="flex flex-col items-stretch border border-gray-400 divide-y divide-gray-400 md:flex-row md:divide-x md:divide-y-0 rounded-xl">
        {showStatus && (
          <div className="self-start w-full px-6 py-10 grow basis-0 md:px-8">
            <div
              data-testid="status"
              className="flex flex-col justify-center gap-8"
            >
              {status && <AnimationContent status={currentStatus} />}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="flex flex-col">
                <span className="text-base">Status</span>
                <span className="text-lg font-bold">{status}</span>
              </div>
              {transactionDetailUrl && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 mt-3 text-lg font-bold lg:mt-auto lg:ml-auto text-brand-ui-primary"
                  href={transactionDetailUrl}
                >
                  <span>See on block explorer</span>
                  <ExternalLinkIcon size={20} />
                </a>
              )}
            </div>
          </div>
        )}
        <div
          data-testid="summary"
          className="flex flex-col gap-8 px-6 py-10 md:px-8 grow basis-0"
        >
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
              {unlimitedDuration ? 'Unlimited' : durationAsText}
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
            <KeyPrice price={formData?.keyPrice} symbol={symbol} />
          </div>
        </div>
      </div>
      {showStatus && (
        <div className="flex flex-col items-center my-12 text-center">
          <h3 className="block mb-4 text-2xl font-bold md:text-4xl">{title}</h3>
          <span className="mb-4 font-base">{description}</span>
          <Link href={'/dashboard'}>
            <Button className="w-full max-w-lg" variant="outlined-primary">
              {backText}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
