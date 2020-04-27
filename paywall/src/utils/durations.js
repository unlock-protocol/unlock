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
      seconds,
    }
  }
  if (seconds < 60 * 60) {
    const minutes = Math.floor(seconds / 60)
    return durations(seconds - minutes * 60, {
      ...intervals,
      minutes,
    })
  }
  if (seconds < 60 * 60 * 24) {
    const hours = Math.floor(seconds / (60 * 60))
    return durations(seconds - hours * 60 * 60, {
      ...intervals,
      hours,
    })
  }
  const days = Math.floor(seconds / (60 * 60 * 24))
  return durations(seconds - days * 60 * 60 * 24, {
    ...intervals,
    days,
  })
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
  return `${asArrayOfValues
    .slice(0, -1)
    .join(', ')} and ${asArrayOfValues.slice(-1)}`
}

/**
 * Given a number of seconds, returns the durations as an array (['10 days', '3 hours', '40 minutes'])
 * @param {number} seconds
 */
export function durationsAsArrayFromSeconds(seconds) {
  const d = durations(seconds, {})
  // remove all values that would map to "0"
  const filteredValues = Object.keys(d).filter(duration =>
    Math.floor(d[duration])
  )
  const asArrayOfValues = filteredValues.map(duration => {
    const durationFloor = Math.floor(d[duration])
    if (durationFloor !== 1) {
      // Singular should only be used when there is exactly 1; otherwise plural is needed
      return `${durationFloor} ${duration}`
    }
    return `${durationFloor} ${duration.slice(0, -1)}` // remove the s!
  })
  return asArrayOfValues
}

/**
 * Given a number of seconds, returns an integer number of days (rounding up)
 * @param seconds
 * @returns {number}
 */
export function secondsAsDays(seconds) {
  return Math.ceil(seconds / 86400).toString()
}

function roundUp(duration) {
  if (duration.minutes > 30) {
    duration.hours = duration.hours || 0
    duration.hours += 1 // round up
  }
  if (duration.hours > 23 || (duration.hours === 23 && duration.minutes > 30)) {
    duration.days = duration.days || 0
    duration.days += 1 // round up
  }
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

  const secondsFromNow = timestamp - Math.floor(new Date().getTime() / 1000)
  const duration = durations(secondsFromNow, {})

  roundUp(duration)

  if (duration.days > 30) {
    // return the date name
    const expirationDate = new Date(0)
    expirationDate.setUTCSeconds(timestamp)
    const day = expirationDate.getDate()
    const month = expirationDate.getMonth()
    const year = expirationDate.getFullYear()

    return `${MONTH_NAMES[month]} ${day}, ${year}`
  }

  // everything below here returns relative duration left

  if (duration.days) {
    const plural = duration.days > 1 ? 's' : ''
    return `${duration.days} Day${plural}`
  }
  if (duration.hours) {
    const plural = duration.hours > 1 ? 's' : ''
    return `${duration.hours} Hour${plural}`
  }
  if (duration.minutes) {
    const plural = duration.minutes > 1 ? 's' : ''
    return `${duration.minutes} Minute${plural}`
  }
  return '< 1 Minute'
}

function pluralize(quantity, unit) {
  const plural = quantity > 1 ? 's' : ''
  return `${unit}${plural}`
}

/**
 * Shows an expiration duration in the largest relevant unit ("1 day" for "1 day, 3 hours, 14 minutes and 34 seconds.")
 * @param {*} timestamp
 */
export function expirationAsText(timestamp) {
  if (!timestamp) return 'Never Expires'

  if (timestamp - new Date().getTime() / 1000 < 0) return 'Expired'

  const secondsFromNow = timestamp - Math.floor(new Date().getTime() / 1000)

  const duration = durations(secondsFromNow, {})

  if (duration.days) {
    // We have days, we show days
    return `Expires in ${Math.floor(duration.days)} ${pluralize(
      duration.days,
      'Day'
    )}`
  }

  if (duration.hours) {
    // We have hours, we show hours
    return `Expires in ${Math.floor(duration.hours)} ${pluralize(
      duration.hours,
      'Hour'
    )}`
  }

  if (duration.minutes) {
    // We have minutes, we show minutes
    return `Expires in ${Math.floor(duration.minutes)} ${pluralize(
      duration.minutes,
      'Minute'
    )}`
  }

  return 'Expires in < 1 Minute'
}

export const currentTimeInSeconds = () => Math.floor(Date.now() / 1000)
