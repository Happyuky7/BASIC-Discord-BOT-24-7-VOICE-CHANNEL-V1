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
const TIME_RECONNECT_RAW = Number.parseInt(process.env.TIME_RECONNECT ?? "", 10);
const TIME_RECONNECT = Number.isFinite(TIME_RECONNECT_RAW) && TIME_RECONNECT_RAW > 0
  ? TIME_RECONNECT_RAW
  : 3000;

if (!TOKEN || !GUILD_ID || !VOICE_CHANNEL_ID) {
  console.error("Missing variables in .env: DISCORD_TOKEN, GUILD_ID, VOICE_CHANNEL_ID");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

let reconnectLock = false;
let started = false;
let reconnectTimer = null;

function scheduleReconnect(reason) {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  console.warn(`[VOICE] Reconnecting in ${TIME_RECONNECT}ms... (${reason})`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect24_7().catch((e) => console.error("Error reconnecting:", e));
  }, TIME_RECONNECT);
}

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

      scheduleReconnect("Disconnected");
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.warn("[VOICE] Connection destroyed.");
      scheduleReconnect("Destroyed");
    });

  } catch (err) {
    console.error("[VOICE] No pude conectar:", err?.message || err);
    scheduleReconnect("Error");
  } finally {
    reconnectLock = false;
  }
}

async function onClientReady() {
  if (started) return;
  started = true;
  console.log(`Listo como ${client.user.tag}`);
  await connect24_7();
}

client.once("ready", onClientReady);
client.once("clientReady", onClientReady);

process.on("SIGINT", () => {
  try {
    const conn = getVoiceConnection(GUILD_ID);
    if (conn) conn.destroy();
  } catch {}

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  process.exit(0);
});

client.login(TOKEN);