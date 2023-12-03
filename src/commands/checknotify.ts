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
          name: "FansDB.cc",
          value: "FansDB",
        })
    ) as SlashCommandBuilder,
  run: async interaction => {
    // check username
    const instanceName = interaction.options.getString("instance");
    const instance = instances[instanceName];
    // create user
    const user = await NotifyUser.createByDiscordInstance(interaction.user.id, instance);
    if (!user) {
      return interaction.reply({
        content: "User not found",
        ephemeral: true,
      });
    }
    await user.update();
    Logger.debug(JSON.stringify(user));
    // get preferences
    const { comment, vote } = user;
    const boolToEmoji = (bool: boolean) => bool ? "✅" : "❌";
    // success
    return interaction.reply({
      content: `Notification preferences on ${instance.name} - Comments: ${boolToEmoji(comment)}, Votes: ${boolToEmoji(vote)}`,
      ephemeral: true,
    });
  },
};
