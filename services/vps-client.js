import axios from 'axios'
import { VP_USERNAME, VP_PASSWORD, DEBUG } from '../configs/general.js'
import '../types/index.js'
import { getAccessToken, getAccountId } from './index.js'
import { now } from '../helpers/time.js'
import { handleError } from './error.js'

const BASE_URL = 'https://external.vpbanks.com.vn'

/**
 *
 * @returns {Promise<{accessToken: string, expiredAt: number}>}
 */
async function fetchAccessToken() {
  if (DEBUG) {
    console.log('fetchAccessToken')
  }
  const path = '/auth/token'
  const response = await axios.post(`${BASE_URL}${path}`, {
    username: VP_USERNAME,
    password: VP_PASSWORD
  })
  const parsed = response.data
  const accessToken = parsed.data?.access_token
  const expiredIn = parsed.data?.expires_in
  if (!accessToken || !expiredIn) {
    throw new Error('Invalid response')
  }

  return {
    accessToken,
    expiredAt: now() + expiredIn
  }
}

/**
 *
 * @param {string} symbol
 * @param {ChartType} chartType
 * @returns {Promise<PriceHistory[]>}
 */
async function fetchChartLine(symbol, chartType) {
  if (DEBUG) {
    console.log('fetchChartLine', symbol, chartType)
  }
  const path = '/invest/api/stock/getPriceChartLine'
  const response = await axios.get(`${BASE_URL}${path}`, {
    params: {
      symbol,
      chartType
    }
  })
  const parsed = response.data
  return parsed?.PriceHistory || []
}

/**
 *
 * @param {PriceHistory[]} prices
 * @returns {{
 *   max: number,
 *   min: number,
 *   maxDate: string,
 *   minDate: string
 * }}
 */
function extractPriceHistory(prices) {
  let max = 0
  let min = Number.MAX_VALUE
  let maxDate = ''
  let minDate = ''
  prices.forEach((price) => {
    if (price.ClosePrice > max) {
      max = price.ClosePrice
      maxDate = price.TradingDate
    }
    if (price.ClosePrice < min) {
      min = price.ClosePrice
      minDate = price.TradingDate
    }
  })

  return {
    max: formatPrice(max),
    min: formatPrice(min),
    maxDate,
    minDate
  }
}

async function fetchWatchList() {
  if (DEBUG) {
    console.log('fetchWatchList')
  }
  const path = '/flex/userdata/watchlists'
  const response = await axios.get(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`
    }
  })
  const parsed = response.data
  const rawWatchList = parsed.d
  const output = []
  rawWatchList.forEach(({ symbols }) => {
    if (symbols && symbols.length > 0) {
      symbols.forEach((symbol) => {
        if (symbol) {
          output.push(symbol)
        }
      })
    }
  })

  return output
}

/**
 *
 * @param {string} symbol
 * @returns {Promise<{next: number, root: number}>}
 */
async function fetchDirection(symbol) {
  if (DEBUG) {
    console.log('fetchDirection', symbol)
  }
  const prices = await fetchChartLine(symbol, '1M')
  prices.sort((a, b) => {
    return new Date(b.TradingDate) - new Date(a.TradingDate)
  })
  const next = prices[0].ClosePrice
  let root = prices[1].ClosePrice
  const direction = next > root
  for (let i = 2; i < prices.length; i++) {
    const price = prices[i].ClosePrice
    const compare = price > root
    if (compare !== direction) {
      root = price
    } else {
      break
    }
  }
  return {
    root: formatPrice(root),
    next: formatPrice(next)
  }
}

async function fetchOwnList() {
  if (DEBUG) {
    console.log('fetchOwnList')
  }
  const path = '/flex/inq/accounts/{account_id}/securitiesPortfolio'
  const accountId = await getAccountId()
  const response = await axios.get(
    `${BASE_URL}${path.replace('{account_id}', accountId.toString())}`,
    {
      headers: {
        Authorization: `Bearer ${await getAccessToken()}`
      }
    }
  )
  const parsed = response.data
  const owns = parsed.d
  return owns.map((own) => {
    return {
      symbol: own.symbol,
      quantity: own.total,
      buy_price: formatPrice(own.costPrice)
    }
  })
}

async function fetchAccountId() {
  if (DEBUG) {
    console.log('fetchAccountId')
  }
  const path = '/flex/accountsAll'
  const response = await axios.get(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`
    }
  })
  const parsed = response.data
  const accounts = parsed.d
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i]
    if (account.producttype === 'NN') {
      return account.id
    }
  }

  handleError('Account ID not found')
  throw new Error('Account ID not found')
}

/**
 *
 * @param {number} price
 * @returns {number}
 */
function formatPrice(price) {
  return parseFloat((price / 1000).toFixed(1))
}

export {
  fetchDirection,
  fetchWatchList,
  fetchOwnList,
  fetchAccountId,
  fetchAccessToken,
  fetchChartLine,
  extractPriceHistory
}
