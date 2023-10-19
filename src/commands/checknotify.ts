// import types
import { SlashCommandBuilder } from "discord.js";
// custom types
import { CommandInt } from "../types/CommandInt";
// modules
import Logger from "../utils/logger";
// config
import { instances } from "../utils/config";
import { NotifyUser } from "../utils/NotifyUser";

export const checknotify: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("checknotify")
    .setDescription("Check notification preferences")
    .addStringOption(option =>
      option
        .setName("instance")
        .setDescription("Stash Instance")
        .setRequired(true)
        .addChoices({
          name: "FansDB.xyz",
          value: "FansDB",
        })
    ) as SlashCommandBuilder,
  run: async interaction => {
    // check username
    const instanceName = interaction.options.getString("Instance");
    const instance = instances[instanceName];
    // create user
    const user = await NotifyUser.createByDiscordInstance(interaction.user.id, instance);
    if (!user) {
      return interaction.reply({
        content: "User not found",
        ephemeral: true,
      });
    }
    Logger.debug(JSON.stringify(user));
    // get preferences
    const { comment, vote } = user;
    // success
    return interaction.reply({
      content: `Notification preferences on ${instance.name} - Comments: ${comment}, Votes: ${vote}`,
      ephemeral: true,
    });
  },
};
