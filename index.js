require('dotenv').config();
const { Client, GatewayIntentBits, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const items = require('./test.prices.json');
const MAX_CHOICES_PER_COMMAND = 8; 

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  const guildId = '1182424226645418096'; 
  const commands = [
    {
      name: 'price',
      description: 'Get information about an item price',
      type: 1, 
      options: [
        {
          name: 'name',
          description: 'Name of the item',
          type: 3, 
          required: true,
        },
      ],
    },
  ];

  const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

  console.log('Started refreshing application (/) commands.');
  console.log('Commands to register:', commands);


  if (client.user) {
    rest.put(
      Routes.applicationGuildCommands(client.user.id, guildId),
      { body: commands },
    ).then(() => {
      console.log('Successfully reloaded application (/) commands.');
    }).catch((error) => {
      console.error(error);
    });
  } else {
    console.error('Client user not available.');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'price') {
    const itemName = options?.getString('name');

    if (itemName) {
      const searchResults = items
        .filter(item => item.name.toLowerCase().includes(itemName.toLowerCase()))
        .slice(0, MAX_CHOICES_PER_COMMAND);

      if (searchResults.length > 0) {
        const embed = {
          title: 'Search Results',
          fields: searchResults.map(item => ({
            name: item.name,
            value: `$${item.price} | Trust Rating: ${item.item_flags.trustRating} | Blacklisted: ${item.item_flags.blackListed ? 'Yes' : 'No'}`,
          })),
          color: parseInt('0099ff', 16),
          thumbnail: {
            url: 'https://media.discordapp.net/attachments/1096504136528314448/1189757647788974180/logo-dark.PNG?ex=659f5327&is=658cde27&hm=03bbc4b315bc7718d61aa36240a27ec8332b4d199fef8601fe9661af0ffbeda9&=&format=webp&quality=lossless&width=671&height=671',
          },
        };

        interaction.reply({ embeds: [embed] });
      } else {
        interaction.reply('No items found matching the search query.');
      }
    } else {
      interaction.reply('Please provide a valid item name.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
