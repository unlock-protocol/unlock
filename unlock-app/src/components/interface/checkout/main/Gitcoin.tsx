import { Fragment } from 'react'
import { useSelector } from '@xstate/react'
import { Button, minifyAddress } from '@unlock-protocol/ui'
import { CheckoutService } from './checkoutMachine'
import {
  FaCheckCircle as CheckIcon,
  FaExclamationCircle as FailIcon,
} from 'react-icons/fa'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import LoadingIcon from '../../Loading'
import { useDataForGitcoinPassport } from '~/hooks/useDataForGitcoinPassport'
import Disconnect from './Disconnect'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  checkoutService: CheckoutService
}

interface CustomErrorType {
  isMisconfigurationError?: boolean
  isInvalidScoreError?: boolean
  isTimeoutError?: boolean
}

export function Gitcoin({ checkoutService }: Props) {
  const { recipients, lock } = useSelector(
    checkoutService,
    (state) => state.context
  )
  const { account } = useAuthenticate()

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

  // evaluate if all recipients, or one recipient have valid Gitcoin Passports
  const allValidPassports = !data || data.every((d) => d !== '')
  // evaluate if at least one recipient has an invalid Gitcoin Passport
  const disabled = !allValidPassports

  // type assertion
  const typedError = error as CustomErrorType

  const onContinue = async () => {
    if (data) {
      checkoutService.send({
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
                Recipients need to have a valid Gitcoin Passport before you can
                proceed. Verify their passports to continue with the checkout
                process.
              </p>
            </>
          )}

          {/* Verification loading, error, and success states */}
          {/* verification in progress state */}
          {isFetchingGitcoinPassportData && (
            <div className="flex flex-col items-center justify-center">
              <LoadingIcon />
              <p className="mt-4 text-center">Verifying Gitcoin passports...</p>

              <div className="mt-4">
                {users.map((user, index) => {
                  if (isLoadingGitcoinPassportData) {
                    return (
                      <li
                        key={user}
                        className="flex items-center w-full gap-1 pl-1 mb-2 text-center"
                      >
                        <LoadingIcon size={14} />
                        {minifyAddress(user)}
                      </li>
                    )
                  }
                  if (data && data[index]) {
                    return (
                      <li
                        key={user}
                        className="flex items-center w-full gap-1 pl-1 mb-2 text-center"
                      >
                        ✅ {minifyAddress(user)}
                      </li>
                    )
                  }
                  return (
                    <li
                      key={user}
                      className="flex items-center w-full gap-1 pl-1 mb-2 text-center"
                    >
                      ❌ {minifyAddress(user)}
                    </li>
                  )
                })}
              </div>
            </div>
          )}

          {/* Invalid Gitcoin Passport states */}
          {/* Render when at least one of multiple recipients has an invalid Gitcoin passport */}
          {disabled && users.length > 1 && (
            <div className="flex flex-col items-center justify-center">
              <FailIcon size={20} className="text-red-500" />
              <p className=" text-center mt-4 text-red-500">
                Some of the selected recipients possess an invalid Gitcoin
                passport{' '}
              </p>
              <div className="mt-4">
                {users.map((user, index) => {
                  if (data && data[index]) {
                    return (
                      <li
                        key={user}
                        className="flex items-center text-green-500 w-full gap-1 pl-1 mb-2 text-center"
                      >
                        ✅ {minifyAddress(user)}
                      </li>
                    )
                  }
                  return (
                    <>
                      <li
                        key={user}
                        className="flex items-center text-red-500 w-full gap-1 pl-1 mb-2 text-center"
                      >
                        ❌ {minifyAddress(user)}
                      </li>
                    </>
                  )
                })}
              </div>
            </div>
          )}

          {/* render when it's a single recipient, and they possess an invalid Gitcoin passport  */}
          {disabled && users.length === 1 && (
            <div className="flex flex-col items-center text-red-500 justify-center">
              <FailIcon size={20} />
              <p className=" text-center mt-4">
                The recipient you have selected possesses an invalid Gitcoin
                passport
              </p>
            </div>
          )}
          {/* Invalid Gitcoin Passport states */}

          {/* Verification success states */}
          {/* when it's one recipient */}
          {isSuccess && allValidPassports && users.length === 1 && (
            <div className="flex flex-col items-center justify-center">
              <CheckIcon size={20} className="text-green-500" />
              <p className="text-center text-slate-700 mt-4">
                Gitcoin Passport successfully verified!
              </p>
            </div>
          )}

          {/* for multiple recipients */}
          {isSuccess && allValidPassports && users.length > 1 && (
            <div className="flex flex-col items-center justify-center">
              <CheckIcon size={20} className="text-green-500" />
              <p className="text-center text-slate-700 mt-4">
                All Gitcoin Passports successfully verified!
              </p>

              <div className="mt-4">
                {users.map((user, index) => {
                  if (data && data[index]) {
                    return (
                      <li
                        key={user}
                        className="flex items-center text-green-500 w-full gap-1 pl-1 mb-2 text-center"
                      >
                        ✅ {minifyAddress(user)}
                      </li>
                    )
                  }
                })}
              </div>
            </div>
          )}
          {/* Verification success states */}

          {/* Verification error states */}
          {isError && (
            <div className="flex flex-col text-red-600  items-center justify-center">
              <FailIcon size={20} />

              {/* Dynamically display error messages */}
              <div className="mt-4 text-center">
                {typedError.isMisconfigurationError &&
                  'Verification failed due to a misconfiguration in your lock.'}
                {typedError.isInvalidScoreError &&
                  'The required Gitcoin Passport score is not defined or invalid.'}
                {typedError.isTimeoutError &&
                  'Timeout: Unable to verify scores within expected time frame.'}
                {!typedError.isMisconfigurationError &&
                  !typedError.isInvalidScoreError &&
                  !typedError.isTimeoutError &&
                  'Verification failed. An unexpected error occurred.'}
              </div>
            </div>
          )}
          {/* Verification error states */}
          {/* Verification loading, error, and success states */}
        </div>
      </main>

      <footer className="grid items-center px-6 pt-6 border-t">
        {/* Show the "Verify" button only initially, before any attempt at verification has been made */}
        {!isFetchingGitcoinPassportData && !isError && !isSuccess && (
          <Button
            className="w-full"
            onClick={(event) => {
              event.preventDefault()
              refetch()
            }}
          >
            Verify Gitcoin Passport{recipients.length > 1 && 's'}
          </Button>
        )}

        {/* Verification in progress button */}
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

        {/* Button to continue to next step upon successful verification */}
        {isSuccess && !isFetchingGitcoinPassportData && allValidPassports && (
          <Button
            className="w-full"
            onClick={(event) => {
              event.preventDefault()
              onContinue()
            }}
          >
            Continue
          </Button>
        )}

        {/* Verification failed disabled button */}
        {disabled && (
          <Button
            className="w-full"
            disabled
            onClick={(event) => {
              event.preventDefault()
              refetch()
            }}
          >
            Continue
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
        <Disconnect service={checkoutService} />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
