import { sendMessage } from './discord-client.js'
import { ERROR_DISCORD_WEBHOOK } from '../configs/general.js'

function handleError(error) {
  const ERROR_TEMPLATE = 'Exception Discord Bot Stock: ```{{{error}}}```'
  sendMessage(
    ERROR_DISCORD_WEBHOOK,
    ERROR_TEMPLATE.replace('{{{error}}}', error)
  )
  return error
}

export { handleError }
