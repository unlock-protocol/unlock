import { Fragment } from 'react'
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

interface CustomErrorType {
  isMisconfigurationError?: boolean
}

export function Gitcoin({ injectedProvider, checkoutService }: Props) {
  const [state, send] = useActor(checkoutService)
  const { account } = useAuth()
  const { recipients, lock } = state.context

  const users = recipients.length > 0 ? recipients : [account!]

  const {
    data,
    isLoading: isLoadingGitcoinPassportData,
    isFetching: isFetchingGitcoinPassportData,
    refetch,
    isError,
    isSuccess,
    error,
  } = useDataForGitcoinPassport({
    lockAddress: lock!.address,
    network: lock!.network,
    recipients: users,
  })

  // type assertion
  const typedError = error as CustomErrorType

  const onProceed = async () => {
    if (data) {
      send({
        type: 'SUBMIT_DATA',
        data,
      })
    }
  }

  return (
    <Fragment>
      <Stepper service={checkoutService} />
      <main className="h-full px-6 flex items-center justify-center py-2 overflow-auto">
        <div>
          {/* Verification Info */}
          {!isFetchingGitcoinPassportData && !isError && !isSuccess && (
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

          {/* Verification loading, error, and success states */}
          {isFetchingGitcoinPassportData && (
            <>
              <LoadingIcon />
              <p className="mt-4 text-center">
                Verifying your Gitcoin passport...
              </p>
            </>
          )}

          {isSuccess && !isFetchingGitcoinPassportData && (
            <div className="flex flex-col items-center justify-center">
              <CheckIcon size={20} className="text-green-500" />
              <div className="text-slate-700 mt-4 text-center">
                Verification passed.
              </div>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center">
              <FailIcon size={20} className="text-red-500" />

              {/* Dynamically display error messages */}
              <div className="text-red-600 mt-4 text-center">
                {typedError && typedError.isMisconfigurationError
                  ? 'Verification failed due to a misconfiguration in your lock.'
                  : 'Verification failed. Your passport is below the required threshold.'}
              </div>
            </div>
          )}
          {/* Verification loading, error, and success states */}
        </div>
      </main>

      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          {/* Show the "Verify" button only initially, before any attempt at verification has been made */}
          {!isFetchingGitcoinPassportData && !isError && !isSuccess && (
            <Button
              className="w-full"
              onClick={(event) => {
                event.preventDefault()
                refetch()
              }}
            >
              Verify Gitcoin Passport to Continue
            </Button>
          )}

          {/* Verification loading button */}
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

          {/* Button to proceed to next step upon successful verification */}
          {isSuccess && !isFetchingGitcoinPassportData && (
            <Button
              className="w-full"
              onClick={(event) => {
                event.preventDefault()
                onProceed()
              }}
            >
              Proceed
            </Button>
          )}

          {/* Retry verification button */}
          {isError && (
            <Button
              className="w-full"
              onClick={(event) => {
                event.preventDefault()
                refetch()
              }}
            >
              Retry
            </Button>
          )}
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
