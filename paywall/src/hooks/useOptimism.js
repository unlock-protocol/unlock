import { useEffect, useRef, useReducer } from 'react'

import useLocksmith from './useLocksmith'
import { OPTIMISM_POLLING_INTERVAL } from '../constants'

export default function useOptimism(transaction) {
  const API = transaction ? `/transaction/${transaction.hash}/odds` : ''
  const hash = transaction ? transaction.hash : false
  const status = transaction ? transaction.status : 'inactive'
  const [locksmithOptimism, resendQuery] = useLocksmith(
    API,
    {
      willSucceed: 0,
    },
    transaction && transaction.status === 'pending'
  )
  const [optimism, setOptimism] = useReducer(
    (state, newState) => {
      if (state.current !== newState) {
        return {
          current: newState,
          past: state.current,
        }
      }
      return state
    },
    { current: locksmithOptimism.willSucceed, past: 0 }
  )
  const timeout = useRef()
  const reQuery = () => {
    resendQuery()
    setTimeout(reQuery, OPTIMISM_POLLING_INTERVAL)
  }
  const endPolling = () => {
    if (timeout.current) {
      clearTimeout(timeout.current)
      timeout.current = undefined
    }
  }
  useEffect(() => {
    if (!hash) {
      endPolling()
    } else {
      // if we reach here, there is a chance that we have
      // gotten a new optimism value from locksmith, so
      // pass it to the reducer
      setOptimism(locksmithOptimism.willSucceed)

      // set up polling from locksmith, which will happen until the
      // transaction is mined
      if (status !== 'pending') {
        endPolling()
        return
      }
      setTimeout(() => {
        reQuery()
      }, OPTIMISM_POLLING_INTERVAL)
    }
  }, [hash, status, locksmithOptimism])

  return optimism
}
