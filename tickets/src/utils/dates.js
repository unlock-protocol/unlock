/**
 * This function returns the future days, months and up to 3 years based on a current
 * date.
 * @param {*} now
 * @param {*} year
 * @param {*} month
 */
export const getDaysMonthsAndYears = (now, year, month) => {
  if (!year) {
    year = now.getFullYear()
  }
  if (!month) {
    month = now.getMonth() + 1
  }

  // Years are the next 3 years
  const years = [0, 1, 2].map(n => now.getFullYear() + n)

  let months = Array.from(new Array(12), (val, index) => index + 1)

  // If year is the current year, we can only pick months in the future
  if (year === now.getFullYear()) {
    months = months.slice(now.getMonth(), months.length)
  }

  let days = Array.from(new Array(31), (val, index) => index + 1)
  // only 30 days!
  if ([4, 6, 9, 11].indexOf(month) > -1) {
    days.pop()
  }

  // February
  if (month === 2) {
    // bissextile years?
    if (year % 4 === 0) {
      // Are we leap?
      if (year % 100 === 0 && year % 400 > 0) {
        days = days.slice(0, 28)
      } else {
        days = days.slice(0, 29)
      }
    } else {
      days = days.slice(0, 28)
    }
  }

  // And now if this is the current month of the current year, we need to remove the days which are behind us
  if (year === now.getFullYear() && month === now.getMonth() + 1) {
    days = days.slice(now.getDate() - 1, days.length)
  }
  return [days, months, years]
}

export const getTimeString = date => {
  let timeString =
    ':' +
    date
      .getMinutes()
      .toString()
      .padStart(2, '0')
  let hour = date.getHours()
  if (hour > 11) {
    timeString = hour - 12 + timeString + 'pm'
  } else if (hour === 0) {
    timeString = '12' + timeString + 'am'
  } else {
    timeString = hour + timeString + 'am'
  }
  return timeString
}

export default {
  getDaysMonthsAndYears,
  getTimeString,
}
