import {
  getAccessToken as modelGetAccessToken,
  saveAccessToken
} from '../models/VpAuthSession.js'
import {
  getWatchList as getSettingsWatchList,
  getAccountId as getSettingsAccountId,
  setSettings
} from '../models/Settings.js'

import {
  extractPriceHistory,
  fetchAccessToken,
  fetchAccountId,
  fetchChartLine,
  fetchDirection,
  fetchWatchList, VP_USERNAME
} from './vps-client.js'
import {
  DEBUG,
  DISCORD_STOCK_LOG_WEBHOOK,
  DISCORD_TEST_LOG_WEBHOOK,
  SUMMARY_TITLE,
} from '../configs/general.js'
import { getOwnStocks, getStocks, Stock } from '../models/Stock.js'
import { isExpired } from '../helpers/index.js'
import { printTable } from './discord-client.js'

/**
 * @returns {Promise<{string}>}
 */
async function getAccessToken() {
  let saved = await modelGetAccessToken(VP_USERNAME)
  if (!saved) {
    const { accessToken, expiredAt } = await fetchAccessToken()
    saved = await saveAccessToken(VP_USERNAME, accessToken, expiredAt)
  }
  return saved
}

/**
 *
 * @returns {Promise<string[]>}
 */
async function getWatchList() {
  const saved = await getSettingsWatchList()
  if (saved.length === 0) {
    return updateWatchList()
  }

  return saved
}

/**
 * @returns {Promise<string[]>}
 */
async function updateWatchList() {
  const watchList = await fetchWatchList()
  await setSettings('watchlist', watchList)
  return watchList
}

/**
 *
 * @returns {Promise<number>}
 */
async function getAccountId() {
  const saved = await getSettingsAccountId()
  if (!saved) {
    try {
      const fetch = await fetchAccountId()
      await setSettings('account_id', fetch)
      return fetch
    } catch (e) {
      console.error(e)
    }
  }
  return saved
}

/**
 *
 * @returns {Promise<void>}
 */
async function printSummary() {
  const watchList = await getWatchList()
  const savedStocks = await getStocks(watchList)

  const table = []
  const option = {
    prefix: false,
    threshold: 15,
    upColor: 'green',
    downColor: 'red',
    withRoot: true,
    length: 5
  }

  for (let i = 0; i < watchList.length; i++) {
    const code = watchList[i]
    let stock = savedStocks[code]
    if (!stock) {
      stock = await initStock(code)
    } else {
      // check expired
      const { expire_last, expire_3m, expire_1Y, expire_3Y } = stock
      const stockClass = new Stock(code)
      let hasChange = false
      if (isExpired(expire_3m)) {
        await initPrice(stockClass, code, '3M')
        hasChange = true
      }
      if (isExpired(expire_1Y)) {
        await initPrice(stockClass, code, '1Y')
        hasChange = true
      }
      if (isExpired(expire_3Y)) {
        await initPrice(stockClass, code, '3Y')
        hasChange = true
      }
      if (isExpired(expire_last)) {
        const { root, next } = await fetchDirection(code)
        stockClass.setDirection(code, root, next)
        hasChange = true
      }
      if (hasChange) {
        const saved = await stockClass.save()
        stock = {
          ...stock,
          ...saved
        }
      }
    }

    const {
      last_price,
      root_price,
      min_3m,
      max_3m,
      min_1Y,
      max_1Y,
      min_3Y,
      max_3Y
    } = stock
    table.push({
      Code: code,
      Last: `${fixedLengthString(last_price, 5)}  ${directionPercent(last_price, root_price)}`,
      'Min 3M': min_3m ?? 'N/A',
      'Max 3M': `${fixedLengthString(max_3m, 5)}  ${directionPercent(max_3m, last_price, option)}`,
      'Min 1Y': min_1Y ?? 'N/A',
      'Max 1Y': `${fixedLengthString(max_1Y, 5)}  ${directionPercent(max_1Y, last_price, option)}`,
      'Max 3Y': `${fixedLengthString(max_3Y, 5)}  ${directionPercent(max_3Y, last_price, option)}`,
      'Min 3Y': min_3Y ?? 'N/A'
    })
  }

  const webhookURL = DEBUG
    ? DISCORD_TEST_LOG_WEBHOOK
    : DISCORD_STOCK_LOG_WEBHOOK
  await printTable(table, SUMMARY_TITLE, webhookURL)
}

function directionPercent(root, sub, options = {}) {
  const defaultOptions = {
    prefix: true,
    threshold: null,
    upColor: 'green',
    downColor: 'red',
    fromAToB: false,
  }
  const option = { ...defaultOptions, ...options }
  const percentLast = option.fromAToB
    ? ((sub - root) / root) * 100
    : ((root - sub) / sub) * 100
  const prefix = option.prefix ? (percentLast >= 0 ? '+' : '') : ''

  let percentLastColor = 'normal'
  if (option.threshold !== null) {
    if (percentLast > option.threshold) {
      percentLastColor = option.upColor
    } else if (percentLast < 0) {
      percentLastColor = option.downColor
    }
  } else {
    percentLastColor = percentLast >= 0 ? option.upColor : option.downColor
  }

  let percentText
  if (Math.abs(percentLast) > 12) {
    percentText = parseInt(percentLast.toString())
  } else if (Math.abs(percentLast) > 1) {
    percentText = percentLast.toFixed(1)
  } else {
    percentText = percentLast.toFixed(2)
  }

  const fullPercentText =
    Math.abs(percentLast) > 0
      ? formatColor(`${prefix}${percentText}%`, percentLastColor)
      : ''
  return `${fullPercentText}`
}

/**
 *
 * @param {string} string
 * @param {string} color
 * @returns {string}
 */
function formatColor(string, color) {
  const colorCodes = {
    red: '31',
    green: '32',
    yellow: '33',
    blue: '34',
    purple: '35',
    cyan: '36',
    white: '37'
  }
  const colorCode = colorCodes[color]
  return colorCode ? `\x1b[2;${colorCode}m${string}\x1b[0m` : string
}

/**
 *
 * @param {string | number} string
 * @param {number} length
 * @returns {string}
 */
function fixedLengthString(string, length) {
  if (typeof string !== 'string') {
    string = string.toString()
  }
  return string.length < length
    ? string + ' '.repeat(length - string.length)
    : string
}

/**
 * Fetches price data for a specific duration and updates the stock record.
 * @param {Stock} stock - The stock object to update.
 * @param {string} code - The stock code.
 * @param {ChartType} type - The duration for which to fetch the price data.
 * @returns {Promise<void>}
 */
async function initPrice(stock, code, type) {
  const prices = await fetchChartLine(code, type)
  const { min, max, maxDate, minDate } = extractPriceHistory(prices)
  stock.setPriceRecord(code, min, max, minDate, maxDate, type)
}

/**
 *
 * @param {string} code
 * @returns {Promise<SavedStock>}
 */
async function initStock(code) {
  const stock = new Stock(code)
  const { root, next } = await fetchDirection(code)
  stock.setDirection(code, root, next)
  await initPrice(stock, code, '3M')
  await initPrice(stock, code, '1Y')
  await initPrice(stock, code, '3Y')
  return await stock.save()
}

async function syncOwnList() {
  const fetched = await fetchWatchList()
  const saved = await getOwnStocks()
}

export {
  getAccessToken,
  getAccountId,
  getWatchList,
  updateWatchList,
  printSummary
}
