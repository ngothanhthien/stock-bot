/**
 *
 * @returns {number}
 */
function now() {
  return Math.floor(Date.now() / 1000)
}

/**
 *
 * @param {number} day
 * @returns {number}
 */
function lastTimeOfNDay(day) {
  let now = new Date()
  let endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + day,
    23,
    59,
    59,
    999
  )
  return endOfDay.getTime()
}

export { now, lastTimeOfNDay }
