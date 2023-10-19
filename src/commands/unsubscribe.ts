// import types
import { SlashCommandBuilder } from "discord.js";
// custom types
import { CommandInt } from "../types/CommandInt";
// modules
import Logger from "../utils/logger";
// config
import { deleteByDiscord } from "../utils/NotifyUser";

export const unsubscribe: CommandInt = {
  data: new SlashCommandBuilder()
    .setName("unsubscribe")
    .setDescription("Unsubscribe from all notifications") as SlashCommandBuilder,
  run: async interaction => {
    // delete user
    await deleteByDiscord(interaction.user.id);
    Logger.debug(`User ${interaction.user.id} deleted from notification database`);
    return interaction.reply({
      content: "User deleted from notification database",
      ephemeral: true,
    });
  },
};
