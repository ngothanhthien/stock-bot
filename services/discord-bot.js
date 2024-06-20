import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js'
import commandMap from '../commands/index.js'
import { decrypt } from '../helpers/index.js'
import dotenv from 'dotenv'
dotenv.config()
const DISCORD_BOT_ID = process.env.DISCORD_BOT_ID
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID
const DISCORD_BOT_TOKEN = decrypt({
  iv: process.env.DISCORD_BOT_KEY,
  encryptedData: process.env.DISCORD_BOT_TOKEN
})

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})
const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN)

client.on('ready', () => console.log(`${client.user.tag} has logged in!`))

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commandMap[interaction.commandName]
  if (command) {
    await command.execute(interaction)
  }
})

async function init() {
  const commands = []
  Object.values(commandMap).forEach((command) => commands.push(command.data))
  await rest.put(
    Routes.applicationGuildCommands(DISCORD_BOT_ID, DISCORD_GUILD_ID),
    {
      body: commands
    }
  )
  await client.login(DISCORD_BOT_TOKEN)
}

await init()
