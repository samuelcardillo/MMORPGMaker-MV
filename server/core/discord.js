/* global MMO_Core */
const { Client, Events, GatewayIntentBits } = require('discord.js');
require("dotenv").config()

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
] });
let channel = "";

client.once(Events.ClientReady, client => {
    client.user.setActivity("MMORPGMV", {
        type: "PLAYING",
        url: "your-url"
    });
	console.log(`Logged in as ${client.user.tag}`);
    channel = client.channels.cache.get(process.env.CHANNEL);
});
client.on(Events.MessageCreate, message => {
	if (!message.guild) return;
    if (message.author.bot) return;
    if (message.content.includes("@here") || message.content.includes("@everyone")) return;
    if(message.channel.id === process.env.CHANNEL) {
        MMO_Core.socket.modules.messages.sendFromDiscord("(Discord) " + message.author.tag, message.content, "discord");
    }    
});
/*****************************
      PUBLIC FUNCTIONS
*****************************/

exports.sendMess = (username, msg) => {
    channel.send(":speech_balloon: "+ username + ": " + msg).catch((err) => {console.log(err)});
}

exports.onAction = (icon, username, message) => {
    channel.send(icon + username + message).catch((err) => {console.log(err)});
}

client.login(process.env.TOKEN);