const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const achievementAdd = require('./../../util/achievementAdd');

module.exports = {
	name: 'create-addon',
	description: 'Create a custom addon!',
	usage: '`/create-addon <name>`',

	permissions: [],
	ownerOnly: false,
	guildOnly: true,
	developerOnly: false,

	data: new SlashCommandBuilder()
		.setName('create-addon')
		.setDescription('Create a custom addon!')

		.addStringOption(option => option
			.setName('name').setDescription('What is the addon\'s name?').setRequired(true),
		),

	error: false,
	execute: async ({ interaction, firestore, userData }) => {
		const name = interaction.options.getString('name');
		const invalid = ['none', 'null', 'undefined', 'nan'];

		if (name.length > 50 || invalid.includes(name.toLowerCase()) || name.includes(' ')) {
			interaction.followUp({ content: 'That is an invalid addon name.' });
			return;
		}

		const paths = [
			'first',
			'second',
			'third',
		];

		let complete = false;
		for (const path of paths) {
			if (userData.addons.customaddons[path].name.toLowerCase() != 'none' && complete == false) {
				complete = true;
				userData.addons.customaddons[path] = {
					name: name,
					description: 'n/a',
					responses: ['The coin landed on heads', 'The coin landed on tails'],
					cost: 0,
					published: false,
					author: interaction.user.id,
				};
			}
		}

		if (complete == false) {
			return interaction.followUp({ content: 'You already have the max of 3 addons, to delete on do `/delete-addon <name>`' });
		}

		const embed = new MessageEmbed()
			.setTitle('Created addon')
			.setDescription(`You created your addon **${name}**! To view it, do \`/view-addon ${name}\`!`);

		interaction.followUp({ embeds: [embed] });

		userData = await achievementAdd(userData, 'builder');
		await firestore.doc(`/users/${interaction.user.id}`).set(userData);

	},
};