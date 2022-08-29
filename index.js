// Require the necessary files
const Discord = require('discord.js');
const Twitter = require('twitter-api-v2')
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
// const { token, twitterBearerToken } = require('./config.json');

dotenv.config();

const token = process.env.token
const twitterBearerToken = process.env.twitterBearerToken

// Create a new client instance
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] });

// Create a new Twitter client
const twitterClient = new Twitter.TwitterApi(twitterBearerToken)

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const Channels = sequelize.define('channels', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	channel_id: Sequelize.STRING,
});

let target
let dest
let stream

// When the client is ready, run this code (only once)
client.once('ready', async () => {
	console.log('Ready!');
	await Channels.sync()
});



// Interactions
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'tweet') {
		if (interaction.user.id === interaction.guild.ownerId){
		let channelSelectorSelect = new Discord.ActionRowBuilder()
		.addComponents(
			new Discord.SelectMenuBuilder()
			.setCustomId('select-tweet-channel')
			.setPlaceholder('Nothing selected')
			.addOptions([{
				label: `Cancel`,
				description: 'Stop.',
				value: 'cancel',
			}]))
	
	client.channels.cache.forEach(channel => {
	
			// add channel to the select menu - the below line was changed
			if (channel.type == 0 && channel.guildId == interaction.guild.id){
			channelSelectorSelect.components[0].addOptions([{
				label: `${channel.name}`,
				description: `${channel.name}`,
				value: `${channel.id}`,
			}]);}
	
	})
		await interaction.reply({ content: 'Scegli un canale!', components: [channelSelectorSelect] });
	}
	else{
		await interaction.reply({content: 'Non puoi farlo!'});
	} 
		}
	}
	)

client.on('interactionCreate', async interaction => {
		if (!interaction.isSelectMenu()) return;
		if(interaction.values == 'cancel'){
			await interaction.reply({content: 'Annullato'})
		}
		else{
			dest = interaction.values.toString()
			try {
				const target = await Channels.create({ name:'Target', description: `target channel`, channel_id: dest, });
				console.log("entry added")
			}
			catch{
				const affectedRows = await Channels.update({ channel_id: dest }, { where: { name: 'Target' } });
				console.log("db updated");				
			}
			try{stream.destroy()}
			catch{console.log("no active stream")}
			await interaction.reply({content: 'Canale scelto.'})
			startStream()
			}		
		}
	);

// Login to Discord with your client's token
client.login(token);
// client.user.setActivity('discord.js', { type: 'WATCHING' });

// Create a stream to follow tweets


// twitterClient.v2.updateStreamRules(
// 		{
// 		  				  
// 		}
// 	  );


const startStream = async () =>{
	try{
	const targetData = await Channels.findOne();
	console.log(targetData)
		try{
			target = targetData.dataValues.channel_id.toString()
			console.log(target)
		}
		catch{
			console.log('cant parse id')
		}
	}
	catch{
		console.log('no channel in the db')
	}
	const rules = await twitterClient.v2.streamRules();
	try {
	console.log(rules.data.map(rule => rule.id));
	}
	catch{
		console.log("No rules setted")
	}
	stream = await  twitterClient.v2.searchStream({"tweet.fields": ["id"]})

	stream.on(Twitter.ETwitterStreamEvent.Data, async (tweet) => {
		console.log(tweet)
		const twitterMessage = `Abbiamo appena twittato: https://twitter.com/MilanDiscordC/status/${tweet.data.id}`
		try {
			client.channels.cache.get(target).send(twitterMessage);
		}
		catch(e) {
			console.log('channel not set or invalid')
			console.log(e)
		}
})

}

startStream()