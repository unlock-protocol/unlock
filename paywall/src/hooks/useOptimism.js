import { useEffect, useReducer, useRef } from 'react'

import useLocksmith from './useLocksmith'
import { OPTIMISM_TIME_LIMIT } from '../constants'

export default function useOptimism(transactionHash) {
  const locksmithOptimism = useLocksmith(
    `/transaction/${transactionHash}/odds`,
    {
      willSucceed: 0,
    }
  ).willSucceed
  const timeout = useRef()
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
    { current: locksmithOptimism, past: 0 }
  )
  useEffect(() => {
    if (!transactionHash) {
      if (timeout.current) {
        clearTimeout(timeout.current)
        timeout.current = undefined
      }
    } else {
      setTimeout(() => {
        setOptimism(0)
      }, OPTIMISM_TIME_LIMIT)
    }
  }, [transactionHash, locksmithOptimism])

  return optimism
}
