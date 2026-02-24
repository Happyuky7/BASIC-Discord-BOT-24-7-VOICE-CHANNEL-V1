require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  getVoiceConnection,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

if (!TOKEN || !GUILD_ID || !VOICE_CHANNEL_ID) {
  console.error("Missing variables in .env: DISCORD_TOKEN, GUILD_ID, VOICE_CHANNEL_ID");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

let reconnectLock = false;

async function connect24_7() {
  if (reconnectLock) return;
  reconnectLock = true;

  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const channel = await guild.channels.fetch(VOICE_CHANNEL_ID);

    if (!channel || channel.type !== 2) { // 2 = GuildVoice
      throw new Error("VOICE_CHANNEL_ID It does not point to a voice channel (GuildVoice).");
    }

    const existing = getVoiceConnection(guild.id);
    if (existing && existing.joinConfig.channelId === channel.id) {
      reconnectLock = false;
      return;
    }

    if (existing) existing.destroy();

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
    console.log(`[VOICE] Successfully connected 24/7 to: ${channel.name} (${channel.id})`);

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.warn("[VOICE] Disconnected. Attempting recovery...");

      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        console.log("[VOICE] Restoring connection without recreating...");
        return;
      } catch (err) {
        console.warn("[VOICE] Soft reconnection failed. Recreating connection...", err);
      }

      try {
        connection.destroy();
      } catch {}

      setTimeout(() => {
        connect24_7().catch((e) => console.error("Error reconnecting:", e));
      }, 3_000);
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.warn("[VOICE] Connection destroyed. Retrying in 3s...");
      setTimeout(() => {
        connect24_7().catch((e) => console.error("Error reconnecting:", e));
      }, 3_000);
    });

  } catch (err) {
    console.error("[VOICE] No pude conectar:", err?.message || err);
    setTimeout(() => {
      connect24_7().catch((e) => console.error("Error reconnecting:", e));
    }, 5_000);
  } finally {
    reconnectLock = false;
  }
}

client.once("ready", async () => {
  console.log(`Listo como ${client.user.tag}`);
  await connect24_7();
});

process.on("SIGINT", () => {
  try {
    const conn = getVoiceConnection(GUILD_ID);
    if (conn) conn.destroy();
  } catch {}
  process.exit(0);
});

client.login(TOKEN);