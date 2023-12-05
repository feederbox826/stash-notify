// import types
import { SlashCommandBuilder } from "discord.js";
// custom types
import { CommandInt } from "../types/CommandInt";
// modules
import Logger from "../utils/logger";
// config
import { instances } from "../utils/config";
import { NotifyUser } from "../utils/NotifyUser";

export const notify: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("notify")
    .setDescription("set notification preferences")
    .addStringOption(option =>
      option
        .setName("instance")
        .setDescription("Stash Instance")
        .setRequired(true)
        .addChoices({
          name: "FansDB.cc",
          value: "FansDB",
        })
    )
    .addStringOption(option =>
      option
        .setName("username")
        .setDescription("username on stash")
        .setRequired(true)
    ).addBooleanOption(option => 
      option
        .setName("comments")
        .setDescription("Notify on new comments on edits")
        .setRequired(true)
    ).addBooleanOption(option => 
      option
        .setName("votes")
        .setDescription("Notify on updates to voted edits")
        .setRequired(true)
    ) as SlashCommandBuilder,
  run: async interaction => {
    // check username
    const username = interaction.options.getString("username");
    const instanceName = interaction.options.getString("instance");
    const instance = instances[instanceName];
    // resolve username
    const stashUserID = await instance.getUserID(username);
    if (!stashUserID) {
      Logger.debug(`Could not find user with username ${username}`);
      return interaction.reply({
        content: `Could not find user with that username on ${instance.name}`,
        ephemeral: true,
      });
    }
    // create user
    const user = new NotifyUser(stashUserID, interaction.user.id, instance);
    // pull options
    const comments = interaction.options.getBoolean("comments");
    const votes = interaction.options.getBoolean("votes");
    // modify preferences
    user.updatePreference(comments, votes);
    const boolToEmoji = (bool: boolean) => bool ? "✅" : "❌";
    // success
    return interaction.reply({
      content: `✅ Updated notification preferences for ${username} on ${instance.name} - Comments: ${boolToEmoji(comments)}, Votes: ${boolToEmoji(votes)}`,
      ephemeral: true,
    });
  },
};
