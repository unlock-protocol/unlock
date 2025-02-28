import { AxiosError } from 'axios'
import { ForwardedRef, useState, useEffect } from 'react'
import { forwardRef } from 'react'
import { FaWallet, FaSpinner } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'
import { isAddress, isValidEnsName } from '../../utils'
import {
  useMutation,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { Input, Props as InputProps } from './Input'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 10 * 1000,
      refetchInterval: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      retry: (failureCount, error) => {
        if (error instanceof AxiosError) {
          return ![400, 401, 403, 404].includes(error.response?.status || 0)
        }
        if (failureCount > 3) {
          return false
        }
        return true
      },
    },
  },
})

export interface Props extends InputProps {
  withIcon?: boolean
  isTruncated?: boolean
  onResolveName: (address: string) => Promise<any>
  ref?: ForwardedRef<HTMLInputElement>
}

const WalletIcon = (props: IconBaseProps) => (
  <FaWallet {...props} className="fill-gray-500" />
)
const LoadingIcon = (props: IconBaseProps) => (
  <FaSpinner {...props} className="fill-gray-500" />
)

export const WrappedAddressInput = ({
  size = 'medium',
  value,
  defaultValue,
  className,
  description,
  label,
  withIcon = true,
  isTruncated = false,
  onChange,
  onResolveName,
  error,
  ref,
  ...inputProps
}: Props) => {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [addressOrEns, setAddressOrEns] = useState<string>(
    (value as string) || (defaultValue as string) || ''
  )
  const [debouncedValue, setDebouncedValue] = useState<string>(addressOrEns)
  const [originalInput, setOriginalInput] = useState<string>('')
  const [isEnsInput, setIsEnsInput] = useState<boolean>(false)

  const resolveNameMutation = useMutation({
    mutationFn: onResolveName,
  })

  // handle the resolution of ENS names or addresses.
  const handleResolver = async (address: string) => {
    try {
      const res: any = await resolveNameMutation.mutateAsync(address)
      if (res) {
        const isError = res?.type === 'error'
        setErrorMessage(
          isError ? `This is not a valid ENS name or address` : ''
        )

        if (res?.type && !isError) {
          // Update the success message only if the original input was an ENS name
          if (isEnsInput) {
            setSuccess(`Successfully resolved from: ${originalInput}`)
          }
          return res.address
        }
      }
      return ''
    } catch (err) {
      setErrorMessage(`This is not a valid ENS name or address`)
      return ''
    }
  }

  // Use a debounce effect to limit the frequency of updates to the resolved address,
  // allowing for a smoother user experience by reducing the number of resolution attempts.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(addressOrEns)
    }, 500)
    return () => clearTimeout(timer)
  }, [addressOrEns])

  /*
  Check the debounced value to determine if it is a valid ENS name
  or a regular Ethereum address. If valid, attempt to resolve the address.
  If the input is invalid, set an appropriate error message.
  */
  useEffect(() => {
    const resolveAddress = async () => {
      if (isValidEnsName(debouncedValue)) {
        setIsEnsInput(true) // Set flag true if input is an ENS name
        const resolvedAddress = await handleResolver(debouncedValue)
        if (resolvedAddress) {
          setAddressOrEns(resolvedAddress)
          if (typeof onChange === 'function') {
            onChange(resolvedAddress)
          }
        }
      } else {
        setIsEnsInput(false) // Set flag false if input is not an ENS name
        if (debouncedValue && !isAddress(debouncedValue)) {
          setErrorMessage(`This is not a valid ENS name or address`)
        }
      }
    }

    resolveAddress()
  }, [debouncedValue])

  return (
    <Input
      {...inputProps}
      type="address"
      value={addressOrEns}
      label={label}
      size={size}
      error={error || errorMessage}
      success={success}
      description={description}
      iconClass={resolveNameMutation.isPending ? 'animate-spin' : ''}
      icon={resolveNameMutation.isPending ? LoadingIcon : WalletIcon}
      ref={ref}
      onChange={(e) => {
        const value: string = e.target.value
        resolveNameMutation.reset() // Reset the mutation to handle new input values.
        setAddressOrEns(value)
        setOriginalInput(value) // Update original input to current value.
        setErrorMessage('') // Clear any previous error messages.
        setSuccess('') // Clear any previous success messages.
      }}
    />
  )
}

/**
 * Primary Input component for React Hook Form
 *
 * @param label - Label for the input
 * @param name - Name of the input
 * @param type - Type of the input
 * @returns Input component
 *
 */
export const AddressInput = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => (
    <QueryClientProvider client={queryClient}>
      <WrappedAddressInput {...props} ref={ref} />
    </QueryClientProvider>
  )
)

AddressInput.displayName = 'AddressInput'
