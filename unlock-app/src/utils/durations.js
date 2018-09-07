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
  const d = durations(seconds, {})
  const asArrayOfValues = Object.keys(d).map(duration => {
    if (d[duration] != 1) { // Singular should only be used when there is exactly 1; otherwise plural is needed
      return `${d[duration]} ${duration}`
    }
    return `${d[duration]} ${duration.slice(0, -1)}` // remove the s!
  })
  if (asArrayOfValues.length === 0) {
    return ''
  }
  if (asArrayOfValues.length === 1) {
    return asArrayOfValues[0]
  }
  return asArrayOfValues.slice(0, -1).join(', ') + ' and ' + asArrayOfValues.slice(-1)
}
