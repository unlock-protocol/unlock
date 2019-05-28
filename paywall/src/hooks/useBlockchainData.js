import useListenForPostMessage from './browser/useListenForPostMessage'
import {
  POST_MESSAGE_UPDATE_ACCOUNT,
  POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
  POST_MESSAGE_UPDATE_LOCKS,
} from '../paywall-builder/constants'
import { isAccount, isPositiveInteger, isValidLocks } from '../utils/validators'

export default function useBlockchainData(window) {
  const address = useListenForPostMessage({
    type: POST_MESSAGE_UPDATE_ACCOUNT,
    defaultValue: null,
    validator: isAccount,
  })
  const balance = useListenForPostMessage({
    type: POST_MESSAGE_UPDATE_ACCOUNT_BALANCE,
    defaultValue: '0',
    validator: isPositiveInteger,
  })
  const locks = useListenForPostMessage({
    type: POST_MESSAGE_UPDATE_LOCKS,
    defaultValue: {},
    validator: isValidLocks,
  })

  const account = address ? { address, balance } : null

  return {
    account,
  }
}
