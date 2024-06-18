import db from '../configs/db.js'
import { DataTypes } from 'sequelize'
import { DEBUG, TIMEZONE } from '../configs/general.js'
import { handleError } from '../services/error.js'
import { DateTime } from 'luxon'

const Settings = db.define(
  'settings',
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    timestamps: false
  }
)
await db.sync()

/**
 *
 * @returns {Promise<string[]>}
 */
async function getWatchList() {
  if (DEBUG) {
    console.log('getWatchList')
  }

  const record = await Settings.findByPk('watchlist')
  if (record && record.value) {
    try {
      return JSON.parse(record.value)
    } catch (e) {
      handleError('getWatchList: ' + e)
    }
  }

  return []
}

/**
 *
 * @param {string} key
 * @param value
 * @returns {Promise<void>}
 */
async function setSettings(key, value) {
  if (DEBUG) {
    console.log('setSettings', key, value)
  }

  await Settings.upsert({
    key: 'watchlist',
    value: typeof value === 'object' ? JSON.stringify(value) : value
  })
}

/**
 * Get account ID
 * @returns {Promise<number>}
 */
async function getAccountId() {
  const record = await Settings.findByPk('account_id')
  if (record && record.value) {
    return parseInt(record.value)
  }

  return null
}

async function setSendSummary() {
  const currentDateUTC7 = DateTime.now().setZone(TIMEZONE).toISO()

  await Settings.upsert({
    key: 'send_summary',
    value: currentDateUTC7
  })
}

async function hasSendSummary() {
  const record = await Settings.findByPk('send_summary')
  if (!record) {
    return false
  }
  const recordDate = DateTime.fromISO(record.value, { zone: 'UTC' }).setZone(TIMEZONE);
  const currentDate = DateTime.now().setZone('Asia/Bangkok')

  return recordDate.hasSame(currentDate, 'day', {})
}

export { getWatchList, setSettings, getAccountId, setSendSummary, hasSendSummary }
