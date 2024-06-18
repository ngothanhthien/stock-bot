import { WebhookClient } from 'discord.js'

function sendMessage(webhookURL, message) {
  const webhookClient = new WebhookClient({ url: webhookURL })

  let formattedMessage = message
  if (message.length > 2000) {
    formattedMessage = message.substring(0, 1997) + '...'
  }
  webhookClient
    .send(formattedMessage)
    .catch((error) => console.error('Error sending message:', error))
}

/**
 *
 * @param {any[]} table
 * @param {string} title
 * @param {string} webhookURL
 * @param {number} LENGTH_THRESHOLD
 * @returns {Promise<void>}
 */
async function printTable(table, title, webhookURL, LENGTH_THRESHOLD = 10) {
  const columnWidths = {}
  const labels = Object.keys(table[0])

  labels.forEach((label) => {
    let maxColumnWidth = label.length
    table.forEach((item) => {
      const columnWidth = visibleLength(item[label].toString())
      maxColumnWidth = Math.max(maxColumnWidth, columnWidth)
    })
    columnWidths[label] = maxColumnWidth
  })

  const webhookClient = new WebhookClient({ url: webhookURL })

  for (let i = 0; i < table.length; i += LENGTH_THRESHOLD) {
    let dataText = '```ansi\n'
    if (i === 0) {
      const header = labels
        .map((label) => label.padEnd(columnWidths[label]))
        .join(' | ')
      dataText += title + '\n' + header + '\n'
    }

    const subTable = table.slice(i, i + LENGTH_THRESHOLD)
    subTable.forEach((item) => {
      const row = labels
        .map((label) =>
          customLjust(item[label].toString(), columnWidths[label])
        )
        .join(' | ')
      dataText += row + '\n'
    })
    dataText += '```'

    if (webhookClient) {
      await webhookClient.send(dataText)
    } else {
      console.log('Webhook client could not be initialized')
    }
  }
}

function visibleLength(s) {
  return s.replace(/\x1B\[[0-;]*[mK]/g, '').length
}

function customLjust(s, width) {
  const needed = width - visibleLength(s)
  return s + ' '.repeat(Math.max(0, needed))
}

export { sendMessage, printTable }
