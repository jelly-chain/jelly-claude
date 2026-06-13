# Discord Skill — Discord Bot API (discord.js v14)

## Overview
The Discord Bot API lets you build bots that can read/send messages, manage roles, react to events, moderate servers, and more. `discord.js` v14 is the standard Node.js library for Discord bots.

## What you need
1. **Discord account** — [discord.com](https://discord.com)
2. **Application + Bot** — [discord.com/developers/applications](https://discord.com/developers/applications) → New Application → Bot tab → Add Bot
3. **Bot Token** — copied from the Bot tab (treat like a password)
4. **Server invite** — use the OAuth2 URL Generator in the portal to invite your bot to a server with the permissions it needs

## Install
```bash
npm install discord.js
```

## Minimal bot setup
```typescript
import { Client, GatewayIntentBits, Events } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // requires privileged intent in portal
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user!.tag}`);
});

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;
  if (msg.content === '!ping') await msg.reply('Pong!');
});

client.login(process.env.DISCORD_BOT_TOKEN);
```

## Send a message to a channel
```typescript
const channel = client.channels.cache.get('CHANNEL_ID');
if (channel?.isTextBased()) {
  await channel.send('Hello from Jelly-Social!');
}
```

## Send a rich embed
```typescript
import { EmbedBuilder } from 'discord.js';

const embed = new EmbedBuilder()
  .setTitle('Market Update')
  .setDescription('SOL is up 5% in the last hour')
  .setColor(0x00bfff)
  .addFields(
    { name: 'Price', value: '$152.30', inline: true },
    { name: 'Volume', value: '$2.1B', inline: true },
  )
  .setTimestamp();

await channel.send({ embeds: [embed] });
```

## Reply to a message
```typescript
client.on(Events.MessageCreate, async (msg) => {
  if (msg.content.startsWith('!price')) {
    const token = msg.content.split(' ')[1] ?? 'SOL';
    await msg.reply(`Current ${token} price: $152.30`);
  }
});
```

## Add a reaction
```typescript
await msg.react('✅');
await msg.react('🚀');
```

## Manage roles
```typescript
const guild  = client.guilds.cache.get('GUILD_ID')!;
const member = await guild.members.fetch('USER_ID');
const role   = guild.roles.cache.find(r => r.name === 'Trader');

if (role) await member.roles.add(role);
```

## Delete messages (moderation)
```typescript
// Delete a single message
await msg.delete();

// Bulk delete messages < 14 days old
const fetched = await msg.channel.messages.fetch({ limit: 10 });
await msg.channel.bulkDelete(fetched);
```

## Slash commands
```typescript
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('price')
    .setDescription('Get current token price')
    .addStringOption(opt => opt.setName('token').setDescription('Token symbol').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);
await rest.put(Routes.applicationCommands('APP_ID'), { body: commands });

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'price') {
    const token = interaction.options.getString('token')!;
    await interaction.reply(`${token}: $152.30`);
  }
});
```

## Send a webhook message (no bot needed)
```typescript
import { WebhookClient, EmbedBuilder } from 'discord.js';

const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL! });
await webhook.send({
  content: '🚨 Alert triggered!',
  embeds: [new EmbedBuilder().setTitle('Price Alert').setDescription('SOL crossed $150')],
});
```

## Required intents reference
| Intent | What it enables |
|--------|----------------|
| `Guilds` | Basic guild/channel info |
| `GuildMessages` | Read messages (privileged for content) |
| `MessageContent` | Read actual text of messages (must enable in portal) |
| `GuildMembers` | Fetch member lists (privileged, enable in portal) |
| `DirectMessages` | Receive DMs |

## Key names (store in ~/.jelly-social/.keys)
```
DISCORD_BOT_TOKEN=
DISCORD_WEBHOOK_URL=
DISCORD_APP_ID=
DISCORD_GUILD_ID=
```
