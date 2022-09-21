import { useQueries } from 'react-query'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { ImageBar } from './ImageBar'
import { MemberCard } from './MemberCard'
import useEns from '~/hooks/useEns'
import { addressMinify } from '~/utils/strings'

interface MembersProps {
  lockAddress: string
  network: number
  filters?: {
    [key: string]: any
  }
}

export const Address = ({ address }: { address: string }) => {
  const addressToEns = useEns(address)

  const resolvedAddress =
    addressToEns === address ? addressMinify(address) : addressToEns

  return <>{resolvedAddress}</>
}

const MembersPlaceholder = () => {
  const placeHolderCardStyle =
    'h-[130px] md:h-[92px] border-2 rounded-lg bg-slate-200 animate-pulse'
  return (
    <div className="flex flex-col gap-3">
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
      <div className={placeHolderCardStyle}></div>
    </div>
  )
}

export const Members = ({
  lockAddress,
  network,
  filters = {
    query: '',
    filterKey: 'owner',
    expiration: 'all',
  },
}: MembersProps) => {
  const { account } = useAuth()
  const walletService = useWalletService()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()

  const getLockManagerStatus = async () => {
    return await web3Service.isLockManager(lockAddress, account!, network)
  }

  const getMembers = async () => {
    await storageService.loginPrompt({
      walletService,
      address: account!,
      chainId: network,
    })
    return storageService.getKeys({
      lockAddress,
      network,
      filters,
    })
  }

  const getLockVersion = async (): Promise<number> => {
    if (!network) return 0
    return web3Service.publicLockVersion(lockAddress, network)
  }

  const [
    { isLoading, data: members = [] },
    { isLoading: isLoadingVersion, data: lockVersion = 0 },
    { isLoading: isLoadingLockManager, data: isLockManager },
  ] = useQueries([
    {
      queryFn: getMembers,
      queryKey: ['getMembers', lockAddress, network],
      onError: () => {
        ToastHelper.error('There is some unexpected issue, please try again')
      },
    },
    {
      queryFn: getLockVersion,
      queryKey: ['getLockVersion', lockAddress, network],
      onError: () => {
        ToastHelper.error('There is some unexpected issue, please try again')
      },
    },
    {
      queryFn: getLockManagerStatus,
      queryKey: ['getLockManagerStatus', lockAddress, network],
    },
  ])

  const loading = isLoadingVersion || isLoading || isLoadingLockManager
  const noItems = members?.length === 0 && !loading

  if (loading) {
    return <MembersPlaceholder />
  }

  if (noItems) {
    return (
      <ImageBar
        src="/images/illustrations/no-member.svg"
        alt="No members"
        description="There is no member yet, but keep it up."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {(members || [])?.map((metadata: any) => {
        const { token, keyholderAddress: owner, expiration } = metadata ?? {}
        return (
          <MemberCard
            key={metadata.token}
            token={token}
            owner={owner}
            expiration={expiration}
            version={lockVersion}
            isLockManager={isLockManager}
            metadata={metadata}
            lockAddress={lockAddress!}
            network={network}
          />
        )
      })}
    </div>
  )
}
