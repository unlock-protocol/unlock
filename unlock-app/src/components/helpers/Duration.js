import React from 'react'
import PropTypes from 'prop-types'
import { durationsAsTextFromSeconds } from '../../utils/durations'

/**
 * Component which shows a duration
 * @param {*} seconds: time in seconds
 */
export function Duration({ seconds }) {
  return (<span>{durationsAsTextFromSeconds(seconds)}</span>)
}

Duration.propTypes = {
  seconds: PropTypes.number,
}

export default Duration
