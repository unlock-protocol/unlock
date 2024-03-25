import { Fragment, useState } from 'react'
import { useActor } from '@xstate/react'
import { Button } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import {
  FaCheckCircle as CheckIcon,
  FaExclamationCircle as FailIcon,
} from 'react-icons/fa'
import { Connected } from '../Connected'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import LoadingIcon from '../../Loading'
import { useDataForGitcoinPassport } from '~/hooks/useDataForGitcoinPassport'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
}

export function Gitcoin({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account } = useAuth()
  const { recipients, lock } = state.context
  const [isSuccess, setIsSuccess] = useState(true)

  const users = recipients.length > 0 ? recipients : [account!]

  const {
    data,
    isLoading: isLoadingGitcoinPassportData,
    isFetching: isFetchingGitcoinPassportData,
    refetch,
    isError,
    // isSuccess,
  } = useDataForGitcoinPassport({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients: users,
  })

  console.log(data, isError)

  const onProceed = async () => {
    console.log(data)
    // send({
    //   type: 'SUBMIT_DATA',
    //   data: verificationData,
    // })
  }

  console.log(isLoadingGitcoinPassportData, isFetchingGitcoinPassportData)

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 flex items-center justify-center py-2 overflow-auto">
        <div>
          {!isFetchingGitcoinPassportData && (
            <>
              <h2 className="text-xl font-semibold text-center">
                Verify Your Gitcoin Passport
              </h2>
              <p className="mt-4 text-center">
                You&apos;ll need to have a valid Gitcoin Passport before you can
                proceed. Please verify your Gitcoin Passport to continue with
                the checkout process.
              </p>
            </>
          )}

          {isFetchingGitcoinPassportData && (
            <>
              <LoadingIcon />
              <p className="mt-4 text-center">
                Verifying your Gitcoin passport...
              </p>
            </>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center">
              <FailIcon size={20} className="text-red-500" />
              <div className="text-red-600 mt-4 text-center">
                Verification failed. Your passport is below the required
                threshold.
              </div>
            </div>
          )}

          {isSuccess && !isFetchingGitcoinPassportData && (
            <div className="flex flex-col items-center justify-center">
              <CheckIcon size={20} className="text-green-500" />
              <div className="text-slate-700 mt-4 text-center">
                Verification passed.
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          {/* Show the "Verify" button only initially, before any attempt at verification has been made */}
          {!isFetchingGitcoinPassportData && (
            <Button
              className="w-full"
              onClick={(event) => {
                event.preventDefault()
                refetch()
                // onProceed()
              }}
            >
              Verify Gitcoin Passport to Continue
            </Button>
          )}

          {isFetchingGitcoinPassportData && (
            <Button
              className="w-full"
              disabled={
                isLoadingGitcoinPassportData || isFetchingGitcoinPassportData
              }
              loading={
                isLoadingGitcoinPassportData || isFetchingGitcoinPassportData
              }
            >
              Verifying...
            </Button>
          )}
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
