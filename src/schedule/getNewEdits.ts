// logger
import Logger from "../utils/logger";
// types
import { StashInstance } from "../utils/StashInstance";
// modules
import { filterEdits } from "../utils/filterComments";
import { Client } from "discord.js";

export async function getNewEditsForInstance(instance: StashInstance, client: Client) {
  const edits = await instance.getAllEdits();
  Logger.debug(`Found ${edits.length} new edits on ${instance.name}`);
  // run through edits
  filterEdits(edits, instance, client);
}