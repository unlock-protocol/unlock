import { useEffect, useRef } from 'react'

/**
 * Run a function repeatedly with a delay. This is a mobile-safe version of setInterval
 * that will automatically start the polling when the component mounts, and remove it when it
 * umounts
 */
export default function usePoll(cb, delay) {
  // we use a ref to avoid re-render on change
  // refs act like class properties and are not to be confused with
  // the old React concept of ref
  const cancel = useRef()
  // this hook only runs on mount and cancels on umount
  useEffect(() => {
    let poll = f => {
      cb()
      cancel.current = setTimeout(f, delay)
    }
    poll = poll.bind(null, poll)
    cancel.current = setTimeout(poll, delay)
    return () => clearTimeout(cancel.current)
  }, [])
}
