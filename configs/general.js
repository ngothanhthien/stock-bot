import dotenv from 'dotenv'
import { decrypt } from '../helpers/index.js'
dotenv.config()
export const VP_USERNAME = process.env.VP_USERNAME
export const VP_PASSWORD = decrypt({
  iv: process.env.VP_PASSWORD_KEY,
  encryptedData: process.env.VP_PASSWORD
})
export const DISCORD_BOT_TOKEN = decrypt({
  iv: process.env.DISCORD_BOT_KEY,
  encryptedData: process.env.DISCORD_BOT_TOKEN
})
export const DISCORD_TEST_LOG_WEBHOOK = process.env.DISCORD_TEST_LOG_WEBHOOK
export const DISCORD_STOCK_LOG_WEBHOOK = process.env.DISCORD_STOCK_LOG_WEBHOOK
export const DISCORD_BOT_ID = process.env.DISCORD_BOT_ID
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID
export const DEBUG = process.env.DEBUG === 'true'
export const ERROR_DISCORD_WEBHOOK = process.env.ERROR_DISCORD_WEBHOOK
export const SUMMARY_TITLE = `
 ______     __  __     __    __     __    __     ______     ______     __  __   
/\\  ___\\   /\\ \\/\\ \\   /\\ "-./  \\   /\\ "-./  \\   /\\  __ \\   /\\  == \\   /\\ \\_\\ \\  
\\ \\___  \\  \\ \\ \\_\\ \\  \\ \\ \\-./\\ \\  \\ \\ \\-./\\ \\  \\ \\  __ \\  \\ \\  __<   \\ \\____ \\ 
 \\/\\_____\\  \\ \\_____\\  \\ \\_\\ \\ \\_\\  \\ \\_\\ \\ \\_\\  \\ \\_\\ \\_\\  \\ \\_\\ \\_\\  \\/\\_____\\
  \\/_____/   \\/_____/   \\/_/  \\/_/   \\/_/  \\/_/   \\/_/\\/_/   \\/_/ /_/   \\/_____/
`
export const TIMEZONE = 'Asia/Bangkok'
