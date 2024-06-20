import { DateTime } from 'luxon'
import { TIMEZONE } from '../configs/general.js'

/**
 * Returns the current Unix timestamp in seconds.
 * @returns {number}
 */
function now() {
  return DateTime.now().setZone(TIMEZONE).toSeconds()
}

/**
 * Returns the Unix timestamp for the end of the specified day from now.
 * @param {number} days - Number of days from now
 * @returns {number}
 */
function lastTimeOfNDay(days) {
  const endOfDay = DateTime.now().setZone(TIMEZONE).plus({ days }).endOf('day', {})
  return endOfDay.toSeconds()
}

export {
  now,
  lastTimeOfNDay
}