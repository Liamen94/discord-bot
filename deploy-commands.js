const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');


const commands = [
	new SlashCommandBuilder().setName('dedo').setDescription('Replies with a dedo sentence!'),
	new SlashCommandBuilder().setName('mdc').setDescription('Replies with mdc info!'),
	new SlashCommandBuilder().setName('mmm').setDescription('Replies with mmm sentence!'),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('me').setDescription('Replies with user info!'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);