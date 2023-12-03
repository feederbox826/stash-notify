import Logger from "../utils/logger";
// config
import { config } from "../utils/config";
// types
import { Client } from "discord.js";
import { REST } from "@discordjs/rest";
import { APIApplicationCommandOption, Routes } from "discord-api-types/v9";
// custom types
import { CommandList } from "../commands/_CommandList";
// db

export const onReady = async (client: Client): Promise<void> => {
  const rest = new REST({ version: "9" }).setToken(config.discord.token);
  const commandData: {
    name: string;
    description?: string;
    type?: number;
    options?: APIApplicationCommandOption[];
  }[] = [];

  CommandList.forEach(command => {
    commandData.push(
      command.data.toJSON() as {
        name: string;
        description?: string;
        type?: number;
        options?: APIApplicationCommandOption[];
      }
    );
  });
  // push global commands
  await rest.put(
    Routes.applicationCommands(config.discord.clientId),
    {
      body: commandData,
    }
  );
  // push guild commands
  for (const guildId of config.discord.guilds) {
    await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, guildId),
      {
        body: commandData,
      }
    );
  }
  Logger.info(client.user.tag + " is ready!");
};
