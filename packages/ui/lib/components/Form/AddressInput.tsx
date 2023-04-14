import { AxiosError } from 'axios'
import {
  InputHTMLAttributes,
  ForwardedRef,
  ReactNode,
  useState,
  useEffect,
} from 'react'
import type { Size } from '../../types'
import { forwardRef } from 'react'
import { FaWallet, FaSpinner } from 'react-icons/fa'
import { IconBaseProps } from 'react-icons'
import { isAddressOrEns, minifyAddress } from '../../utils'
import {
  useMutation,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { Input } from './Input'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 10,
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

export interface Props
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'size' | 'id' | 'children'
  > {
  label?: string
  size?: Size
  description?: ReactNode
  withIcon?: boolean
  isTruncated?: boolean
  optional?: boolean
  onResolveName: (address: string) => any
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
  isTruncated = false, // address not truncated by default
  onChange,
  onResolveName,
  ...inputProps
}: Props) => {
  const [error, setError] = useState<any>('')
  const [success, setSuccess] = useState('')
  const [address, setAddress] = useState<string>(value as string)

  const onReset = () => {
    setError('')
    setSuccess('')
  }

  const resolveNameMutation = useMutation(onResolveName, {
    onMutate: () => {
      onReset() // restore state when typing
    },
  })

  const handleResolver = async (address: string) => {
    try {
      const res: any = await resolveNameMutation.mutateAsync(address)
      if (res) {
        const isError = res?.type === 'error'

        setError(isError ? `It's not a valid ens name or address` : '') // set error when is error

        if (res && (res?.type || '')?.length > 0) {
          if (res.type === 'address') {
            setSuccess(res.name)
          }

          if (res.type === 'name') {
            setSuccess(res.address)
          }
        }
        return res.address
      }
      return ''
    } catch (err) {
      onReset()
      setError(`It's not a valid ens name or address`)
      return ''
    }
  }

  useEffect(() => {
    if (
      (typeof defaultValue === 'string' && defaultValue.length === 0) ||
      (typeof value === 'string' && value === '')
    ) {
      setAddress('')
      onReset()
    }
  }, [defaultValue, value])

  return (
    <Input
      {...inputProps}
      type="address"
      value={address}
      label={label}
      error={error}
      success={isTruncated ? minifyAddress(success) : success}
      description={description}
      iconClass={resolveNameMutation.isLoading ? 'animate-spin' : ''}
      icon={resolveNameMutation.isLoading ? LoadingIcon : WalletIcon}
      onChange={async (e) => {
        const value: string = e.target.value
        await resolveNameMutation.reset() // reset mutation
        setAddress(value)

        if (isAddressOrEns(value)) {
          try {
            const res = await handleResolver(value)
            if (typeof onChange === 'function' && res) {
              onChange(res)
            }
          } catch (_err) {}
        } else {
          setError(`It's not a valid ens name or address`)
          if (typeof onChange === 'function') {
            onChange(value as any)
          }
        }
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
  (props: Props, ref: ForwardedRef<HTMLInputElement>) => {
    const {
      size = 'medium',
      value,
      defaultValue,
      className,
      description,
      label,
      withIcon = true,
      isTruncated = false, // address not truncated by default
      onChange,
      onResolveName,
      ...inputProps
    } = props
    return (
      <QueryClientProvider client={queryClient}>
        <WrappedAddressInput {...props} />
      </QueryClientProvider>
    )
  }
)

AddressInput.displayName = 'AddressInput'
