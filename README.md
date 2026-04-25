### As of April 25, 2026, Pi Tracker is no longer being maintained.

# About

A Discord bot that provides real-time (~1 minute) price tracking, wallet balances, mining rates, and other relevant information about the Pi Network. 

This is not the most recent version of the bot. This is a working version but it is outdated and does not contain all of the bot's current features.

# Dependencies
Axios 1.6.7

discord.js 14.14.1

dotenv 5.0.0

# Installation
Make sure you have Node.JS 16.11+

Clone the repository.

```
git clone https://github.com/ifeeljoy/pi-tracker.git
```

Install dependencies.

```
npm install discord.js dotenv axios
```

Rename '.env-example' to '.env' and add your bot token and client ID.

```
// Your Discord bot's token.
BOT_TOKEN=here

// Your Discord bot's application ID.
CLIENT_ID=here

// The current base rate for mining Pi. Can be found in the Pi app.
MINING_RATE=here
```

Run the bot.

```
node index.js
```

# License
This project is licensed under the GNU Affero General Public License v3.0. See the LICENSE file for more details.
