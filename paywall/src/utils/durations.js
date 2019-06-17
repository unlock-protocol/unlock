import { MONTH_NAMES } from '../constants'

/**
 * Function which computes days, hours, minutes and seconds based on seconds
 * We limit ourselves to days because months and years can becomes messy (variable duration!)
 * @param {*} seconds
 * @param {*} intervals
 */
export function durations(seconds, intervals) {
  if (!seconds) {
    return intervals
  }
  if (seconds < 60) {
    return {
      ...intervals,
      seconds: seconds,
    }
  } else if (seconds < 60 * 60) {
    let minutes = Math.floor(seconds / 60)
    return durations(seconds - minutes * 60, {
      ...intervals,
      minutes,
    })
  } else if (seconds < 60 * 60 * 24) {
    let hours = Math.floor(seconds / (60 * 60))
    return durations(seconds - hours * 60 * 60, {
      ...intervals,
      hours,
    })
  } else {
    let days = Math.floor(seconds / (60 * 60 * 24))
    return durations(seconds - days * 60 * 60 * 24, {
      ...intervals,
      days,
    })
  }
}

/**
 * Given a number of seconds, returns the durations as text (10 days, 3 hours and 40 minutes)
 * @param {number} seconds
 */
export function durationsAsTextFromSeconds(seconds) {
  const asArrayOfValues = durationsAsArrayFromSeconds(seconds)
  if (asArrayOfValues.length === 0) {
    return ''
  }
  if (asArrayOfValues.length === 1) {
    return asArrayOfValues[0]
  }
  return (
    asArrayOfValues.slice(0, -1).join(', ') +
    ' and ' +
    asArrayOfValues.slice(-1)
  )
}

/**
 * Given a number of seconds, returns the durations as an array (['10 days', '3 hours', '40 minutes'])
 * @param {number} seconds
 */
export function durationsAsArrayFromSeconds(seconds) {
  const d = durations(seconds, {})
  const asArrayOfValues = Object.keys(d).map(duration => {
    const durationFloor = Math.floor(d[duration])
    // map to an empty string to avoid "0 seconds"
    if (durationFloor === 0) return ''
    if (durationFloor !== 1) {
      // Singular should only be used when there is exactly 1; otherwise plural is needed
      return `${durationFloor} ${duration}`
    }
    return `${durationFloor} ${duration.slice(0, -1)}` // remove the s!
  })
  // remove the "0 seconds" etc. entries that mapped to ""
  return asArrayOfValues.filter(a => a) // remove empty entries
}

/**
 * Given a number of seconds, returns an integer number of days (rounding up)
 * @param seconds
 * @returns {number}
 */
export function secondsAsDays(seconds) {
  return Math.ceil(seconds / 86400).toString()
}

function isLessThanADay(timestamp) {
  return timestamp - new Date().getTime() / 1000 < 86400
}

/**
 * Given an epoch timestamp, returns a string of the form 'Month Day, Year' (eg, 'Dec 31, 1980')
 * @param timestamp
 * @returns {string}
 */
export function expirationAsDate(timestamp) {
  if (!timestamp) {
    return 'Never'
  }

  // If it is less than now, we show as expired
  if (timestamp - new Date().getTime() / 1000 < 0) {
    return 'Expired'
  }

  if (isLessThanADay(timestamp)) {
    // If it is less than a day from now we provide more granular details, from now
    const secondsFromNow = timestamp - Math.floor(new Date().getTime() / 1000)
    return durationsAsTextFromSeconds(secondsFromNow)
  }

  let expirationDate = new Date(0)
  expirationDate.setUTCSeconds(timestamp)
  let day = expirationDate.getDate()
  let month = expirationDate.getMonth()
  let year = expirationDate.getFullYear()

  return MONTH_NAMES[month] + ' ' + day + ', ' + year
}

export function expirationAsText(timestamp) {
  const text = expirationAsDate(timestamp)
  if (isLessThanADay(timestamp)) {
    return `Expires in ${text}`
  }
  return `Expires ${text}`
}
