// types
import {
  Client,
} from "discord.js";
// events
import { onReady } from "./events/onReady";
import { onInteraction } from "./events/onInteraction";
// schedule
import { getNewEditsForInstance } from "./schedule/getNewEdits";
// modules
import { schedule } from "node-cron";
import { setup } from "./utils/db";
// config
import { instances, config } from "./utils/config";
import Logger from "./utils/logger";

// setup db
const client = new Client({
  intents: [],
});

// discord events
client.on("ready", async () => await onReady(client));
client.on(
  "interactionCreate",
  async interaction => await onInteraction(interaction)
);
client.on("rateLimit", data => {
  Logger.debug("rate limited" + JSON.stringify(data));
  Logger.debug("lifted in " + data.timeout);
});

// startup
setup()
  .then(() => client.login(config.discord.token));

// start setup
if (!config.testMode) {
  // getNewEditsForInstance every 10 minutes
  schedule("*/10 * * * *", () => {
    for (const instance of Object.values(instances)) {
      getNewEditsForInstance(instance, client);
    }
  });
} else {
  Logger.warn("Test mode enabled");
  for (const instance of Object.values(instances)) {
    getNewEditsForInstance(instance, client);
  }
}