import dotenv from 'dotenv'
dotenv.config()
export const DISCORD_TEST_LOG_WEBHOOK = process.env.DISCORD_TEST_LOG_WEBHOOK
export const DISCORD_STOCK_LOG_WEBHOOK = process.env.DISCORD_STOCK_LOG_WEBHOOK
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
