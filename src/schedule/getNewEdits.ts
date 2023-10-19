// logger
import Logger from "../utils/logger";
// types
import { StashInstance } from "../utils/StashInstance";
// modules
import { filterEdits } from "../utils/filterComments";

export async function getNewEditsForInstance(instance: StashInstance) {
  const edits = await instance.getAllEdits();
  Logger.debug(`Found ${edits.length} new edits on ${instance.name}`);
  // run through edits
  filterEdits(edits, instance);
}