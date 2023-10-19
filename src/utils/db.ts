import sqlite3 from "sqlite3";
import { Database } from "sqlite";

import config from "./config";
import Logger from "./logger";

let db;

(async () => {
    db = new Database({
      filename: config.database.filename,
      driver: sqlite3.cached.Database
    });
    db.open();
})();

export async function setup() {
    await db.run("CREATE TABLE IF NOT EXISTS notifyUser (userId TEXT, discordId TEXT, instance TEXT, comment BOOLEAN, vote BOOLEAN)");
    await db.run("CREATE TABLE IF NOT EXISTS notifiedComments (commentId TEXT)");
    await db.run("CREATE TABLE IF NOT EXISTS notifiedVotes (editId TEXT, userId TEXT, date TEXT)");
    Logger.info("Database opened");
}

type QueryType = "get" | "all" | "run";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function prepare(type: QueryType, query: string, args: any[] = []) {
    const stmt = await db.prepare(query);
    await stmt.bind(args);
    switch (type) {
        case "get":
            return await stmt.get();
        case "all":
            return await stmt.all();
        case "run":
            return await stmt.run();
    }
}

export default {
    setup,
    prepare,
};