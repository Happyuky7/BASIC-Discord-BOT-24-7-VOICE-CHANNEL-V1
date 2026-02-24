
# BASIC-DISCORD-BOT-24-7-VOICE-CHANNEL-V1

BASIC Discord bot that stays connected to a voice channel **24/7** and automatically tries to reconnect if the connection drops.

## Download

[Donwload Latest Version (Source) / Node.js Support 24.X ](https://github.com/Happyuky7/BASIC-Discord-BOT-24-7-VOICE-CHANNEL-V1/releases)

---

## Install

- Install Node.js **24.X**.
- Download/Clone the repository.
- Install dependencies with `npm install`.
- Create a `.env` file (copy from `example.env`).
- Start the bot with `npm start`.

### .env example

```dotenv
DISCORD_TOKEN=YOUR_BOT_TOKEN
GUILD_ID=YOUR_SERVER_ID
VOICE_CHANNEL_ID=YOUR_VOICE_CHANNEL_ID
```

**Note (Discord Portal / Intents):**
Ensure to enable **Privileged Gateway Intents** only if you need them, but for this bot normally this is enough:

- Server Members Intent: **NO necesario**
- Presence Intent: **NO necesario**

In code we use:

- `Guilds`
- `GuildVoiceStates`

---

## Commands

- `npm start` - Start the bot.
- `npm run dev` - Start the bot (same as start).

---

## Permissions

- `View Channel` - The bot must see the voice channel.
- `Connect` - The bot must be able to join.

Optional:

- `Speak` - Only if you later add audio playback.

---

## How To (Compiling From Source)

To run this project from source, you need Node.js 24, git and npm.

Clone the repository with the following command:

```bash
$ git clone https://github.com/Happyuky7/BASIC-Discord-BOT-24-7-VOICE-CHANNEL-V1.git
```

Once downloaded in the terminal use the following command:

```bash
$ cd BASIC-Discord-BOT-24-7-VOICE-CHANNEL-V1
```

Now inside the directory you execute:

```bash
$ npm install
```

Copy env file and configure it:

```bash
# Windows (PowerShell)
Copy-Item example.env .env

# Windows (CMD)
copy example.env .env

# macOS/Linux
cp example.env .env
```

Start the bot:

```bash
$ npm start
```

---

## Join us

* Feel free to open a PR! We accept contributions.
* [Discord](https://discord.gg/3EebYUyeUX)

---

## Aditional Information

[My website](https://happyuky7.com), My website

[Discord](https://discord.gg/3EebYUyeUX), Support My Server Discord

---

## Contributors

- [**Happyuky7**](https://github.com/Happyuky7) - Main Developer and Maintainer.

---

© Copyright Happyuky7 2017-2026 ©

Licensed under the MIT License. See [LICENSE](LICENSE).

## Special Thanks To

[Node.js](https://nodejs.org/), JavaScript runtime.

[discord.js](https://discord.js.org/), Discord API library for Node.js.

[Visual Studio Code](https://code.visualstudio.com/), Code editor.


