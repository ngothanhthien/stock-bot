/**
 * @typedef {Object} EncryptedObj
 * @property {string} iv
 * @property {string} encryptedData
 */

/**
 * @typedef {'1W' | '1M' | '3M' | '1Y' | '3Y'} ChartType
 */

/**
 * @typedef {Object} PriceHistory
 * @property {string} TradingDate - The trading date in ISO 8601 format.
 * @property {number} OpenPrice - float && VND
 * @property {number} ClosePrice - float && VND
 * @property {number} CloseOldPrice - float && VND
 * @property {number} HighestPrice - float && VND
 * @property {number} LowestPrice - float && VND
 * @property {number} TotalMatchVolume - float
 */

/**
 * @typedef {Object} SavedStock
 * @property {string} code
 * @property {number} root_price
 * @property {number} last_price
 * @property {number} min_3m
 * @property {number} max_3m
 * @property {string} date_min_3m
 * @property {string} date_max_3m
 * @property {number} min_1Y
 * @property {number} max_1Y
 * @property {string} date_min_1Y
 * @property {string} date_max_1Y
 * @property {number} min_3Y
 * @property {number} max_3Y
 * @property {string} date_min_3Y
 * @property {string} date_max_3Y
 */
