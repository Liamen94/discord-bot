// Require the necessary files
const express = require('express');
const Discord = require('discord.js');
const Twitter = require('twitter-api-v2')
const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log('Listening') );

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
      dest = interaction.channelId.toString()
      try {
        const target = await Channels.create({ name: 'Target', description: `target channel`, channel_id: dest, });
        console.log("entry added")
      }
      catch {
        const affectedRows = await Channels.update({ channel_id: dest }, { where: { name: 'Target' } });
        console.log("db updated");
      }
      try { stream.destroy() }
      catch { console.log("no active stream") }
      await interaction.reply({ content: 'I tweet verranno postati qui.', ephemeral: true })
      startStream()


    }
  }
  else {
    await interaction.reply({ content: 'Non puoi farlo!' });
  }
}

)

client.on('interactionCreate', async interaction => {
  if (!interaction.isSelectMenu()) return;
  if (interaction.values == 'cancel') {
    await interaction.reply({ content: 'Annullato' })
  }
  else {
    dest = interaction.values.toString()
    try {
      const target = await Channels.create({ name: 'Target', description: `target channel`, channel_id: dest, });
      console.log("entry added")
    }
    catch {
      const affectedRows = await Channels.update({ channel_id: dest }, { where: { name: 'Target' } });
      console.log("db updated");
    }
    try { stream.destroy() }
    catch { console.log("no active stream") }
    await interaction.reply({ content: 'Canale scelto.' })
    startStream()
  }
}
);

// Login to Discord with your client's token
client.login(token);
// client.user.setActivity('discord.js', { type: 'WATCHING' });

// Create a stream to follow tweets


twitterClient.v2.updateStreamRules(
  {
    add: [
      { value: "MilanDiscordC -(is:retweet OR is:reply)", tag: "mdc" },
    ]

  }
);

const startStream = async () => {
  try {
    const targetData = await Channels.findOne();
    console.log(targetData)
    try {
      target = targetData.dataValues.channel_id.toString()
      // console.log(target)
    }
    catch {
      console.log('cant parse id')
    }
  }
  catch {
    console.log('no channel in the db')
  }
  const rules = await twitterClient.v2.streamRules();
  try {
    console.log(rules.data.map(rule => rule.id));
  }
  catch {
    console.log("No rules setted")
  }
  stream = await twitterClient.v2.searchStream({ "tweet.fields": ["id"] })

  const temporary = '990876793974161448'

  stream.on(Twitter.ETwitterStreamEvent.Data, async (tweet) => {
    console.log(tweet)
    const twitterMessage = `Abbiamo appena twittato: https://twitter.com/MilanDiscordC/status/${tweet.data.id}`
    try {
      client.channels.cache.get(temporary).send(twitterMessage);
      console.log(client.channels.get(temporary))
    }
    catch (e) {
      console.log('channel not set or invalid')
      console.log(e)
    }
  })

}

startStream()
