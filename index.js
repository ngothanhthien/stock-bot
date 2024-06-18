import { DateTime } from 'luxon'
import { printSummary } from './services/index.js'
import { hasSendSummary, setSendSummary } from './models/Settings.js'
import { TIMEZONE } from './configs/general.js'
import './services/discord-bot.js'

const HOUR_1 = 60 * 60 * 1000
function main() {
  printSummarySchedule(HOUR_1)
}

/**
 *
 * @param {number} initialInterval
 * @return void
 */
async function printSummarySchedule(initialInterval) {
  let currentInterval = initialInterval

  const runTask = async () => {
    currentInterval = initialInterval
    if (!(await hasSendSummary())) {
      await printSummary()
      await setSendSummary()
    } else {
      const now = DateTime.now().setZone(TIMEZONE)
      const next = now.plus({ days: 1 }).set({ hour: 9, minute: 0, second: 0, millisecond: 0 })
      currentInterval = next - now
    }
    setTimeout(runTask, currentInterval)
  }

  await runTask()
}

main()
