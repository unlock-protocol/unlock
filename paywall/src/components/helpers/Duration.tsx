import React from 'react'
import {
  durationsAsTextFromSeconds,
  durationsAsArrayFromSeconds,
} from '../../utils/durations'

interface DurationProps {
  seconds?: number
  round?: boolean
}
/**
 * Component which shows a duration, rounded to next day if `round` is `true`
 * @param {*} seconds: time in seconds
 */
export function Duration({ seconds, round }: DurationProps) {
  if (seconds === null || typeof seconds === 'undefined') {
    return <span> - </span>
  }
  if (round) {
    return <span>{durationsAsArrayFromSeconds(seconds)[0]}</span>
  }
  return <span>{durationsAsTextFromSeconds(seconds)}</span>
}

export default Duration
