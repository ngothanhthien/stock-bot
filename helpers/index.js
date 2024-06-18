import crypto from 'crypto'
import dotenv from 'dotenv'
import '../types/index.js'
import { now } from './time.js'
dotenv.config()

const algorithm = 'aes-256-cbc'
const key = crypto
  .createHash('sha256')
  .update(process.env.APP_NAME)
  .digest('base64')
  .substring(0, 32)

/**
 *
 * @param text
 * @returns {EncryptedObj}
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return { iv: iv.toString('hex'), encryptedData: encrypted }
}

/**
 *
 * @param {EncryptedObj} encryptedObj
 * @returns {string}
 */
export function decrypt(encryptedObj) {
  const iv = Buffer.from(encryptedObj.iv, 'hex')
  const encryptedText = Buffer.from(encryptedObj.encryptedData, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted += decipher.final('utf8')
  return decrypted.toString()
}

/**
 *
 * @param {number} expiredAt
 * @returns {boolean}
 */
export function isExpired(expiredAt) {
  return !expiredAt || expiredAt < now()
}
