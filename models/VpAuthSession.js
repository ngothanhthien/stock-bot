import { DataTypes } from 'sequelize'
import db from '../configs/db.js'
import { decrypt, encrypt, isExpired } from '../helpers/index.js'
import { DEBUG } from '../configs/general.js'

const VpAuthSession = db.define(
  'vp_auth_session',
  {
    username: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expired_at: {
      type: DataTypes.NUMBER,
      allowNull: false
    }
  },
  {
    timestamps: false
  }
)
await db.sync()

/**
 *
 * @param {string} username
 * @returns {Promise<string>}
 */
export async function getAccessToken(username) {
  if (DEBUG) {
    console.log('getAccessToken ', username)
  }
  const record = await VpAuthSession.findByPk(username)
  if (!record || !record.access_token || !record.key) {
    return null
  }

  const expiredAt = record.expired_at
  if (isExpired(expiredAt)) {
    return null
  }
  return decrypt({
    iv: record.key,
    encryptedData: record.access_token
  })
}

/**
 *
 * @param {string} username
 * @param {string} accessToken
 * @param {number} expiredAt
 * @returns {Promise<string>}
 */
export async function saveAccessToken(username, accessToken, expiredAt) {
  if (DEBUG) {
    console.log('saveAccessToken ', username)
  }
  const encryptedObj = encrypt(accessToken)
  const oldRecord = await VpAuthSession.findByPk(username)
  const insertData = {
    access_token: encryptedObj.encryptedData,
    key: encryptedObj.iv,
    expired_at: expiredAt
  }
  if (oldRecord) {
    await oldRecord.update(insertData)
  } else {
    await VpAuthSession.create({
      username,
      ...insertData
    })
  }
  return accessToken
}
