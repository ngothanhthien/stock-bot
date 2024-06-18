import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js'
import {
  DISCORD_BOT_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_GUILD_ID
} from '../configs/general.js'
import commandMap from '../commands/index.js'

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
