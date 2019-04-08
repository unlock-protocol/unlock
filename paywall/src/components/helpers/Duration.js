import React from 'react'
import PropTypes from 'prop-types'
import {
  durationsAsTextFromSeconds,
  durationsAsArrayFromSeconds,
} from '../../utils/durations'

/**
 * Component which shows a duration, rounded to next day if `round` is `true`
 * @param {*} seconds: time in seconds
 */
export function Duration({ seconds, round }) {
  if (seconds === null) {
    return <span> - </span>
  }
  if (round) {
    return <span>{durationsAsArrayFromSeconds(seconds)[0]}</span>
  }
  return <span>{durationsAsTextFromSeconds(seconds)}</span>
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
