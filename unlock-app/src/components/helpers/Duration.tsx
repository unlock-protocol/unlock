import React from 'react'
import {
  durationsAsTextFromSeconds,
  secondsAsDays,
} from '../../utils/durations'

/**
 * Component which shows a duration, rounded to next day if `round` is `true`
 * @param {*} seconds: time in seconds
 */
export function Duration({
  seconds = null,
  round = false,
}: {
  seconds?: number | null
  round?: boolean
}) {
  if (seconds === null) {
    return <span> - </span>
  }
  if (seconds === -1) {
    return <span>Forever</span>
  }
  const days = secondsAsDays(seconds)
  const roundedSeconds = Number(days) * secondsInADay
  return (
    <span>{durationsAsTextFromSeconds(round ? roundedSeconds : seconds)}</span>
  )
}

export default Duration

const secondsInADay = 86400
