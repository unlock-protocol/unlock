import { MAX_UINT, MONTH_NAMES, UNLIMITED_KEYS_DURATION } from '../constants'
import dayjs from 'dayjs'
import relative from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import custom from 'dayjs/plugin/customParseFormat'
import updateLocale from 'dayjs/plugin/updateLocale'
import { ethers } from 'ethers'
dayjs.extend(relative)
dayjs.extend(duration)
dayjs.extend(custom)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'A few seconds',
    m: '1 minute',
    mm: '%d minutes',
    h: '1 hour',
    hh: '%d hours',
    d: '1 day',
    dd: '%d days',
    w: '%d week',
    ww: '%d weeks',
    M: '1 month',
    MM: '%d months',
    y: '1 year',
    yy: '%d years',
  },
})

/**
 * Function which computes days, hours, minutes and seconds based on seconds
 * We limit ourselves to days because months and years can becomes messy (variable duration!)
 * @param {*} seconds
 * @param {*} intervals
 */
export function durations(
  seconds: number,
  intervals: Record<string, number>
): Record<string, number> {
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
export function durationsAsTextFromSeconds(seconds: number) {
  if (seconds === UNLIMITED_KEYS_DURATION) {
    return 'Forever'
  }

  if (seconds < 1) {
    // 0 or 0.5 - return empty.
    return ''
  }

  const d = durations(seconds, {})
  const asArrayOfValues = Object.keys(d).map((duration) => {
    if (d[duration] !== 1) {
      // Singular should only be used when there is exactly 1; otherwise plural is needed
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
  return `${asArrayOfValues
    .slice(0, -1)
    .join(', ')} and ${asArrayOfValues.slice(-1)}`
}

/**
 * Given a number of seconds, returns an integer number of days (rounding up)
 * @param seconds
 * @returns {number}
 */
export function secondsAsDays(seconds: number) {
  return Math.ceil(seconds / 86400).toString()
}

/**
 * Given an epoch timestamp, returns a string of the form 'Month Day, Year' (eg, 'Dec 31, 1980')
 * @param timestamp
 * @returns {string}
 */
export function expirationAsDate(timestamp: any) {
  if (!timestamp || timestamp === MAX_UINT || timestamp === -1) {
    return 'Never'
  }

  // If it is less than now, we show as expired
  if (timestamp - new Date().getTime() / 1000 < 0) {
    return 'Expired'
  }

  if (timestamp - new Date().getTime() / 1000 < 86400) {
    // If it is less than a day from now we provide more granular details, from now
    const secondsFromNow = timestamp - Math.floor(new Date().getTime() / 1000)
    return durationsAsTextFromSeconds(secondsFromNow)
  }

  const expirationDate = new Date(0)
  expirationDate.setUTCSeconds(timestamp)
  const day = expirationDate.getDate()
  const month = expirationDate.getMonth()
  const year = expirationDate.getFullYear()

  return `${MONTH_NAMES[month]} ${day}, ${year}`
}

export const durationAsText = (duration?: string) => {
  if (!duration) {
    return null
  }
  if (ethers.BigNumber.from(duration).eq(MAX_UINT)) {
    return 'Unlimited'
  }
  return dayjs
    .duration(ethers.BigNumber.from(duration).div(60).toNumber(), 'minutes')
    .humanize()
}
