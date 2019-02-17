import { useEffect, useRef } from 'react'

/**
 * Run a function repeatedly with a delay. This is a mobile-safe version of setInterval
 * that will automatically start the polling when the component mounts, and remove it when it
 * umounts
 */
export default function usePoll(cb, delay, noPoll = false) {
  // we use a ref to avoid re-render on change
  // refs act like class properties and are not to be confused with
  // the old React concept of ref
  const cancel = useRef()
  // this hook only runs on mount and cancels on umount
  useEffect(
    () => {
      if (noPoll) return
      if (cancel.current) clearTimeout(cancel.current)
      function poll() {
        cb()
        cancel.current = setTimeout(poll, delay)
      }
      poll()
      return () => clearTimeout(cancel.current)
    },
    [cb]
  )
}
