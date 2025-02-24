const { Client, GatewayIntentBits, ActivityType, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const PREFIX = 'pi!';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&include_24hr_change=true';
const MINING_RATE = parseFloat(process.env.MINING_RATE); // Read mining rate from .env

const commands = [
    new SlashCommandBuilder().setName('price').setDescription('Get the current price of Pi Network.'),
    new SlashCommandBuilder().setName('help').setDescription('Show the list of available commands.'),
    new SlashCommandBuilder().setName('support').setDescription('Get a link to the support server.'),
    new SlashCommandBuilder().setName('donate').setDescription('Help keep the bot running.'),
    new SlashCommandBuilder().setName('vote').setDescription('Vote for the bot on top.gg'),
    new SlashCommandBuilder().setName('ping').setDescription('Check bot latency.'),
    new SlashCommandBuilder().setName('mining').setDescription('Displays the current mining rates.'), // Updated command description
    new SlashCommandBuilder().setName('exchanges').setDescription('Get a list of verified exchanges where Pi is available.')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
async function registerCommands() {
    try {
        console.log('Registering slash commands...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('Slash commands registered successfully.');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
}

async function updateBotInfo() {
    try {
        const response = await axios.get(COINGECKO_API_URL);
        const data = response.data['pi-network'];

        if (!data) throw new Error('No data received from CoinGecko API');

        const price = data.usd;
        const change24h = data.usd_24h_change !== undefined ? data.usd_24h_change.toFixed(2) : 'N/A';
        const percentChange = data.usd_24h_change > 0 ? `+${change24h}%` : `${change24h}%`;

        console.log('API Response:', JSON.stringify(data, null, 2));
        console.log(`Price: ${price}, 24h Change: ${change24h}`);

        // Update bot's presence
        client.user.setPresence({
            activities: [{ name: `Pi Network (24h: ${percentChange})`, type: ActivityType.Playing }],
            status: 'online'
        });

        // Update bot's bio
        await client.application.edit({
            description: `v2.3.8
1 Pi: $${price}`
        });

        // Update bot's display name
        client.guilds.cache.forEach(guild => {
            guild.members.cache.get(client.user.id).setNickname(`Pi: $${price}`);
        });

        console.log(`Updated status, display name, and bio: Price - $${price}, 24h Change - ${percentChange}`);
    } catch (error) {
        console.error('Failed to update bot information:', error.message);
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await registerCommands();
    updateBotInfo();
    setInterval(updateBotInfo, 180000); // Update status and bio every 3 minutes
    setInterval(updateBotInfo, 60000); // Update display name every 60 seconds
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'price') {
        try {
            const response = await axios.get(COINGECKO_API_URL);
            const price = response.data['pi-network'].usd;
            const embed = new EmbedBuilder()
                .setTitle('Pi Network Price')
                .setDescription(`The current price of Pi Network is **$${price} USD**.`)
                .setColor(0x4C2F71);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply('Failed to fetch price. Please try again later.');
        }
    } else if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('Help Menu')
            .setDescription('**Available Commands:** `/price`, `/help`, `/support`, `/donate`, `/vote`, `/ping`, `/mining`, `/exchanges`')
            .setColor(0x4C2F71);
        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'support') {
        const embed = new EmbedBuilder()
            .setTitle('Support')
            .setDescription('For support, please visit [here](https://discord.gg/kJ8eRH4kfe)')
            .setColor(0x4C2F71);
        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'donate') {
        const embed = new EmbedBuilder()
            .setTitle('Donate')
            .setDescription('[$3 a month keeps the bot running!](https://buymeacoffee.com/mozzarella)')
            .setColor(0x4C2F71);
        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'vote') {
        const embed = new EmbedBuilder()
            .setTitle('Vote')
            .setDescription('[Vote for the bot](https://top.gg/bot/1342105252484350012/vote)')
            .setColor(0x4C2F71);
        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'ping') {
        const ping = Date.now() - interaction.createdTimestamp;
        const embed = new EmbedBuilder()
            .setTitle('Ping')
            .setDescription(`Pong! Latency is **${ping}ms** :ping_pong:.`)
            .setColor(0x4C2F71);
        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'mining') {
        try {
            const response = await axios.get(COINGECKO_API_URL);
            const price = response.data['pi-network'].usd;
            const hoursToEarnOnePi = (1 / MINING_RATE).toFixed(2);
            const hoursToEarnOneDollar = (1 / (price * MINING_RATE)).toFixed(2);
            const embed = new EmbedBuilder()
                .setTitle('Mining Rate')
                .setDescription(`The current mining base rate is **${MINING_RATE} π/hour**.\n≈ **${hoursToEarnOnePi} hours** to earn 1 Pi.\n≈ **${hoursToEarnOneDollar} hours** to earn $1 of Pi.`)
                .setColor(0x4C2F71);
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply('Failed to fetch price. Please try again later.');
        }
    } else if (commandName === 'exchanges') {
        const embed = new EmbedBuilder()
            .setTitle('Pi Network Exchanges')
            .setDescription(`**Here is a list of exchanges where Pi is available:**
[OKX](https://www.okx.com/price/pi-network-pi)
[Bitget](https://www.bitget.com/price/pi-network)
[Gate.io](https://www.gate.io/price/pi-network-pi)
<:nPionex:1342941462710718555> [Pionex](https://www.pionex.com/trade/PI_USDT)/[Pionex.us](https://www.pionex.us/trade/PI_USDT)
[MEXC](https://www.mexc.com/price/PI)

Only exchanges verified through [Pi Network's KYB](https://minepi.com/kyb-list/#VerifiedBusinesses) will be listed here.`)
            .setColor(0x4C2F71);
        await interaction.reply({ embeds: [embed] });
    }
});

client.login(process.env.BOT_TOKEN);