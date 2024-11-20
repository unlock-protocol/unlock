import { CheckoutService, LockState } from './checkoutMachine'
import { useConfig } from '~/utils/withConfig'
import { LockOptionPlaceholder, Pricing } from '../Lock'
import { useSelector } from '@xstate/react'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useQuery } from '@tanstack/react-query'
import { Fragment, useState, useMemo, useEffect } from 'react'
import { RadioGroup } from '@headlessui/react'
import {
  RiCheckboxBlankCircleLine as CheckBlankIcon,
  RiCheckboxCircleFill as CheckIcon,
  RiTimer2Line as DurationIcon,
  RiCoupon2Line as QuantityIcon,
  RiRepeatFill as RecurringIcon,
  RiCheckboxCircleFill as CheckMarkIcon,
} from 'react-icons/ri'
import { Badge, Button, Icon } from '@unlock-protocol/ui'
import { LabeledItem } from '../LabeledItem'
import * as Avatar from '@radix-ui/react-avatar'
import { numberOfAvailableKeys } from '~/utils/checkoutLockUtils'
import { minifyAddress } from '@unlock-protocol/ui'
import { useCreditCardEnabled } from '~/hooks/useCreditCardEnabled'
import { getLockUsdPrice } from '~/hooks/useUSDPricing'
import { shouldSkip } from './utils'
import { AiFillWarning as WarningIcon } from 'react-icons/ai'
import { useGetLockProps } from '~/hooks/useGetLockProps'
import Disconnect from './Disconnect'
import { useMemberships } from '~/hooks/useMemberships'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ethers } from 'ethers'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  checkoutService: CheckoutService
}

interface LockOptionProps {
  lock: LockState
  disabled: boolean
}

const LockOption = ({ disabled, lock }: LockOptionProps) => {
  const config = useConfig()

  const { data: creditCardEnabled } = useCreditCardEnabled({
    lockAddress: lock.address,
    network: lock.network,
  })

  const { isLoading: isLoadingFormattedData, data: formattedData } =
    useGetLockProps({
      lock: lock,
      baseCurrencySymbol: config.networks[lock.network].nativeCurrency.symbol,
    })

  const showRenewalLabel =
    lock.recurringPayments === 'forever' ||
    !isNaN(Number(lock.recurringPayments))

  const numberOfRenewals = !isNaN(Number(lock.recurringPayments))
    ? `${lock.recurringPayments} times`
    : ''

  return (
    <RadioGroup.Option
      disabled={disabled}
      key={lock.address}
      value={lock}
      className={({ checked, disabled }) =>
        `flex flex-col p-2 w-full gap-2 items-center border border-gray-200 rounded-xl cursor-pointer relative ${
          checked && 'border-ui-main-100 bg-gray-100'
        } ${disabled && 'opacity-80 bg-gray-100 cursor-not-allowed'}`
      }
    >
      {({ checked }) => {
        const lockImageURL = `${config.services.storage.host}/lock/${lock?.address}/icon`

        return (
          <Fragment>
            <div className="flex w-full gap-x-4">
              <div>
                <Avatar.Root className="inline-flex items-center justify-center w-14 h-14 rounded-xl">
                  <Avatar.Image
                    className="object-cover w-full m-auto aspect-1"
                    src={lockImageURL}
                    alt={lock.name}
                  />
                  <Avatar.Fallback className="bg-gray-50">
                    {lock.name.slice(0, 2).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
              </div>
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col gap-1">
                  <RadioGroup.Label
                    className="text-lg font-bold line-clamp-1"
                    as="p"
                  >
                    {lock.name}
                  </RadioGroup.Label>
                </div>

                <Pricing
                  keyPrice={formattedData?.formattedKeyPrice}
                  usdPrice={formattedData?.convertedKeyPrice}
                  isCardEnabled={!!creditCardEnabled}
                  loading={isLoadingFormattedData}
                />
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between w-full place-items-center">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {formattedData?.formattedDuration !== 'Forever' && (
                    <>
                      <LabeledItem
                        label="Duration"
                        icon={DurationIcon}
                        value={formattedData?.formattedDuration}
                      />
                      {showRenewalLabel && (
                        <LabeledItem
                          label="Auto-renew"
                          icon={RecurringIcon}
                          value={numberOfRenewals}
                        />
                      )}
                    </>
                  )}
                  {formattedData?.formattedKeysAvailable === '0' && (
                    <LabeledItem
                      icon={QuantityIcon}
                      label="Coming soon"
                      value={''}
                    />
                  )}
                  {formattedData?.formattedKeysAvailable !== '0' &&
                    formattedData?.isSoldOut && (
                      <LabeledItem
                        icon={QuantityIcon}
                        label="Sold out"
                        value={''}
                      />
                    )}
                  {formattedData?.formattedKeysAvailable !== 'Unlimited' &&
                    !formattedData?.isSoldOut && (
                      <LabeledItem
                        label="Left"
                        icon={QuantityIcon}
                        value={formattedData?.formattedKeysAvailable}
                      />
                    )}
                </div>
                <div>
                  {checked ? (
                    <Icon
                      size={25}
                      className="fill-brand-ui-primary"
                      icon={CheckIcon}
                    />
                  ) : (
                    <Icon
                      size={25}
                      className="fill-brand-ui-primary"
                      icon={CheckBlankIcon}
                    />
                  )}
                </div>
              </div>
              {lock.isMember && (
                <div className="flex items-center justify-between w-full px-2 py-1 text-sm text-gray-500 border border-gray-300 rounded">
                  You already have this membership{' '}
                  <Badge
                    size="tiny"
                    iconRight={<CheckMarkIcon />}
                    variant="green"
                  >
                    {' '}
                    Valid{' '}
                  </Badge>
                </div>
              )}
              {lock.isExpired && (
                <div className="flex items-center justify-between w-full px-2 py-1 text-sm text-gray-500 border border-gray-300 rounded">
                  Your membership is expired.{' '}
                  <Badge size="tiny" iconRight={<WarningIcon />} variant="red">
                    Expired
                  </Badge>
                </div>
              )}
            </div>
          </Fragment>
        )
      }}
    </RadioGroup.Option>
  )
}

export function Select({ checkoutService }: Props) {
  const { signInWithSIWE } = useAuthenticate()

  const { paywallConfig, lock: selectedLock } = useSelector(
    checkoutService,
    (state) => state.context
  )
  const [lock, setLock] = useState<LockState | undefined>(selectedLock)
  const [autoSelectedLock, setAutoSelectedLock] = useState<
    LockState | undefined
  >(undefined)

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const { isPending: isLocksLoading, data: locks } = useQuery({
    queryKey: ['locks', JSON.stringify(paywallConfig)],
    queryFn: async () => {
      const items = await Promise.all(
        Object.entries(paywallConfig.locks)
          .sort(([, l], [, m]) => {
            return (l.order || 0) - (m.order || 0)
          })
          .map(async ([lock, props]) => {
            const networkId: number =
              props.network || paywallConfig.network || 1

            const lockData = await web3Service.getLock(lock, networkId)
            let price

            if (account) {
              try {
                price = await web3Service.purchasePriceFor({
                  lockAddress: lock,
                  userAddress: account,
                  referrer: account,
                  network: networkId,
                  // We do not have the data
                  data: '0x',
                })

                price = parseFloat(
                  ethers.formatUnits(price, lockData.currencyDecimals)
                )
              } catch (e) {
                console.error(e)
                price = Number(lockData.keyPrice)
              }
            } else {
              price = Number(lockData.keyPrice)
            }

            const fiatPricing = await getLockUsdPrice({
              network: networkId,
              currencyContractAddress: lockData?.currencyContractAddress,
              amount: price,
            })

            return {
              ...props,
              ...lockData,
              keyPrice: price,
              name: props.name || lockData.name,
              network: networkId,
              address: lock,
              fiatPricing,
              isSoldOut: numberOfAvailableKeys(lockData) <= 0,
            } as LockState
          })
      )

      const locks = items?.filter(
        (item) => !(item.isSoldOut && paywallConfig.hideSoldOut)
      )

      return locks
    },
  })

  // This should be executed only if router is defined
  useEffect(() => {
    if (locks && searchParams.get('lock')) {
      const autoSelectedLock = locks?.find(
        (lock) => lock.address === searchParams.get('lock')
      )

      // Remove the lock from the query string
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('lock')
      router.replace(`${pathname}?${newSearchParams.toString()}`, {
        scroll: false,
      })

      setAutoSelectedLock(autoSelectedLock)
    }
  }, [locks, searchParams, pathname, router])

  useEffect(() => {
    if (!autoSelectedLock) {
      return
    }
    checkoutService.send({
      type: 'CONNECT',
      lock,
      existingMember: autoSelectedLock.isMember,
      expiredMember: autoSelectedLock.isExpired,
      skipQuantity,
      skipRecipient,
      recipients: account ? [account] : [],
    })
  }, [autoSelectedLock])

  const locksGroupedByNetwork = useMemo(
    () =>
      locks?.reduce<{
        [key: number]: LockState[]
      }>((acc, item) => {
        const current = acc[item.network]
        if (current) {
          acc[item.network] = [...current, item]
        } else {
          acc[item.network] = [item]
        }
        return acc
      }, {}),
    [locks]
  )

  const lockOptions = useMemo(() => {
    return Object.entries(paywallConfig.locks).map(([lock, props]) => ({
      ...props,
      address: lock,
      network: props.network || paywallConfig.network || 1,
    }))
  }, [paywallConfig.locks, paywallConfig.network])

  const { skipQuantity, skipRecipient } = useMemo(
    () =>
      shouldSkip({
        lock,
        paywallConfig,
      }),
    [lock, paywallConfig]
  )

  const skipSelect = useMemo(() => {
    const skip = paywallConfig.skipSelect
    return skip === true && Object.keys(paywallConfig.locks).length === 1
  }, [paywallConfig])

  const config = useConfig()
  const { account } = useAuthenticate()
  const web3Service = useWeb3Service()
  const expectedAddress = paywallConfig.expectedAddress

  const isNotExpectedAddress = !!(
    account &&
    expectedAddress &&
    expectedAddress.toLowerCase() !== account.toLowerCase()
  )

  const { isLoading: isMembershipsLoading, data: memberships } = useMemberships(
    {
      account,
      paywallConfig: paywallConfig,
    }
  )

  const membership = memberships?.find((item) => item.lock === lock?.address)

  const isDisabled =
    isLocksLoading ||
    isMembershipsLoading ||
    !lock ||
    // if locks are sold out and the user is not an existing member of the lock
    (lock?.isSoldOut && !(membership?.member || membership?.expired)) ||
    isNotExpectedAddress

  useEffect(() => {
    if (locks?.length) {
      const filtered = locks.filter((lock) => !lock.isSoldOut)
      const item = filtered.find((lock) => lock.default)
      setLock(item || filtered[0])
    }
  }, [locks])

  const isLoading = isLocksLoading || isMembershipsLoading

  useEffect(() => {
    if (!(lock && skipSelect && account && !isLoading)) {
      return
    }

    // Connected account, lock selected, move on!
    checkoutService.send({
      type: 'CONNECT',
      lock,
      existingMember: !!membership?.member,
      skipQuantity,
      skipRecipient,
      // unlock account are unable to renew : wut?
      expiredMember: !!membership?.expired,
      recipients: account ? [account] : [],
    })
  }, [
    lock,
    membership,
    account,
    skipQuantity,
    skipRecipient,
    checkoutService,
    skipSelect,
    isLoading,
  ])

  useEffect(() => {
    const selectedLock = searchParams.get('selectedLock')
    const privyOAuthState = searchParams.get('privy_oauth_state')
    const privyOAuthProvider = searchParams.get('privy_oauth_provider')
    const privyOAuthCode = searchParams.get('privy_oauth_code')

    if (
      selectedLock &&
      privyOAuthState &&
      privyOAuthProvider &&
      privyOAuthCode
    ) {
      const lock = locks?.find((l) => l.address === selectedLock)
      if (lock) {
        checkoutService.send({
          type: 'CONNECT',
          lock,
          existingMember: lock.isMember,
          expiredMember: lock.isExpired,
          skipQuantity,
          skipRecipient,
          recipients: account ? [account] : [],
        })

        // clean up urls
        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete('selectedLock')
        newSearchParams.delete('privy_oauth_state')
        newSearchParams.delete('privy_oauth_provider')
        newSearchParams.delete('privy_oauth_code')
        router.replace(`${pathname}?${newSearchParams.toString()}`, {
          scroll: false,
        })
      }
    }
  }, [
    searchParams,
    account,
    checkoutService,
    locks,
    skipQuantity,
    skipRecipient,
    router,
    pathname,
  ])

  const selectLock = async (event: any) => {
    event.preventDefault()

    if (!lock) {
      return
    }

    // add selectedLock to url
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('selectedLock', lock.address)
    router.replace(`${pathname}?${newSearchParams.toString()}`, {
      scroll: false,
    })

    if (paywallConfig.useDelegatedProvider) {
      await signInWithSIWE()
    }

    checkoutService.send({
      type: 'CONNECT',
      lock,
      existingMember: lock.isMember,
      expiredMember: lock.isExpired,
      skipQuantity,
      skipRecipient,
      recipients: account ? [account] : [],
    })
  }

  return (
    <Fragment>
      <Stepper
        service={checkoutService}
        existingMember={!!membership?.member}
        isRenew={!!membership?.expired}
      />
      <main className="h-full px-6 py-2 overflow-auto">
        {isLoading ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: lockOptions.length }).map((_, index) => (
              <LockOptionPlaceholder key={index} />
            ))}
          </div>
        ) : (
          <RadioGroup
            key="select"
            className="box-content space-y-6"
            value={lock || {}}
            onChange={setLock}
          >
            {locksGroupedByNetwork &&
              Object.entries(locksGroupedByNetwork).map(([network, locks]) => {
                const showNetworkSection =
                  Object.keys(locksGroupedByNetwork).length > 1

                return (
                  <section
                    key={network}
                    className={
                      showNetworkSection ? 'grid gap-4' : 'grid gap-4 pt-2'
                    }
                  >
                    {showNetworkSection && (
                      <p className="text-lg font-bold text-brand-ui-primary">
                        {config?.networks[network]?.name}
                      </p>
                    )}
                    {locks.map((lock) => {
                      const isMember = !!memberships?.find(
                        (m) => m.lock === lock.address
                      )?.member
                      const isExpired = !!memberships?.find(
                        (m) => m.lock === lock.address
                      )?.expired
                      const disabled = lock.isSoldOut && !lock.isMember
                      lock.isMember = lock.isMember ?? isMember
                      lock.isExpired = lock.isExpired ?? isExpired
                      return (
                        <LockOption
                          key={lock.address}
                          lock={lock}
                          disabled={disabled}
                        />
                      )
                    })}
                  </section>
                )
              })}
          </RadioGroup>
        )}
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <div className="grid">
          {isNotExpectedAddress && (
            <p className="mb-2 text-sm text-center">
              Switch to wallet address {minifyAddress(expectedAddress)} to
              continue.
            </p>
          )}
          <Button disabled={isDisabled} onClick={selectLock}>
            Next
          </Button>
        </div>
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
