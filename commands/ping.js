import { SlashCommandBuilder } from 'discord.js'

const command = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!')

export default {
  data: command.toJSON(),
  async execute(interaction) {
    await interaction.reply('Pong!')
  }
}
