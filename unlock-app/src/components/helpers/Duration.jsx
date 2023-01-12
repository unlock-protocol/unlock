import React from 'react'
import PropTypes from 'prop-types'
import {
  durationsAsTextFromSeconds,
  secondsAsDays,
} from '../../utils/durations'
import { MAX_UINT } from '../../constants'

/**
 * Component which shows a duration, rounded to next day if `round` is `true`
 * @param {*} seconds: time in seconds
 */
export function Duration({ seconds, round }) {
  if (seconds === null) {
    return <span> - </span>
  }
  if (seconds === -1) {
    return <span>Forever</span>
  }
  const days = secondsAsDays(seconds)
  const roundedSeconds = days * secondsInADay
  return (
    <span>{durationsAsTextFromSeconds(round ? roundedSeconds : seconds)}</span>
  )
}

Duration.propTypes = {
  seconds: PropTypes.number,
  round: PropTypes.bool,
}

Duration.defaultProps = {
  seconds: null,
  round: false,
}

export default Duration

const secondsInADay = 86400
