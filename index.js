// Require the necessary files
const Discord = require('discord.js');
const Twitter = require('twitter-api-sdk')
const { token, streamChannel, twitterBearerToken } = require('./config.json');

// Create a new client instance
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds] });

// Create a new Twitter client
const twitterClient = new Twitter.Client(twitterBearerToken)

let Channels

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	Channels = client.channels.cache.map(channel => channel.id);
    console.log(Channels)
});


// Interactions
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'dedo') {
		await interaction.reply(`Vero.\n-Dedo`);
	} else if (commandName === 'mdc') {
		await interaction.reply('Server sul Milan');
	} else if (commandName === 'mmm') {
		await interaction.reply('Compriamo un 2009 congolese!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'me') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	}else if (interaction.commandName === 'tweet') {
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
			if (channel.type == 0){
			channelSelectorSelect.components[0].addOptions([{
				label: `${channel.name}`,
				description: `${channel.name}`,
				value: `${channel.id}`,
			}]);}
	
	})
		await interaction.reply({ content: 'Ok!', components: [channelSelectorSelect] });
	}
	}
	)

client.on('interactionCreate', async interaction => {
		if (!interaction.isSelectMenu()) return;
		if(interaction.values == 'cancel'){
			await interaction.reply({content: 'Annullato'})
		}
		else{
			const dest = interaction.values.toString()
			await interaction.reply({content: 'Canale scelto.'})
			tweetStream(dest)
		}
	});

// Login to Discord with your client's token
client.login(token);
// client.user.setActivity('discord.js', { type: 'WATCHING' });

// Create a stream to follow tweets

const tweetStream = async (dest) => {
	console.log(dest)
	await twitterClient.tweets.addOrDeleteRules(
		{
		  add: [
			{ value: "from:Every3Minutes -(is:retweet OR is:reply)", tag: "every3minutes" },
		  ]
		}
	  );
	  const rules = await twitterClient.tweets.getRules();
// const stream =  twitterClient.tweets.sampleStream('statuses/filter', {
// 	follow: '2899773086', // @Every3Minutes, specify whichever Twitter ID you want to follow
//   });
const stream =  twitterClient.tweets.searchStream({
	"tweet.fields": ["id"]
});


 for await (const tweet of stream){
	console.log(tweet)
	const twitterMessage = `@Every3Minutes tweeted this: https://twitter.com/Every3Minutes/status/${tweet.data.id}`
	client.channels.cache.get(dest).send(twitterMessage);
  };
}


// tweetStream();