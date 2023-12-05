import { User, Comment, Edit, Vote } from "../types/Stash";
import { prepare } from "./db";
import Logger from "./logger";
import { StashInstance } from "./StashInstance";
import { Client, EmbedBuilder } from "discord.js";
import config from "./config";

export enum notifyTypes {
    COMMENTS = "comment",
    VOTES = "vote",
}

export async function deleteByDiscord(discordId: string) {
    await prepare("run", "DELETE * FROM notifyUser WHERE discordId = ?", [discordId]);
}

export class NotifyUser {
    public id: string;
    public discordId: string;
    public instance: StashInstance;
    public comment: boolean = false;
    public vote: boolean = false;
    public exists: boolean = false;
    constructor(id: string, discordId?: string, instance?: StashInstance) {
        this.id = id;
        this.discordId = discordId;
        this.instance = instance;
        this.update();
    }
    public static async createByDiscordInstance (discordId: string, instance: StashInstance) {
        const res = await prepare("get", "SELECT * FROM notifyUser WHERE discordId = ? AND instance = ?", [discordId, instance.name]);
        if (!res) return null;
        return new NotifyUser(res.userId, res.discordId);
    }
    private async fetchUserByID (value: string): Promise<NotifyUser | null> {
        const res = await prepare("get", "SELECT * FROM notifyUser WHERE userId = ?", [value]);
        return res;
    }
    public async update() {
        const user = await this.fetchUserByID(this.id);
        if (user) {
            this.exists = true;
            this.comment = Boolean(user.comment);
            this.vote = Boolean(user.vote);
            this.discordId = user.discordId;
        } else if (config.testMode) {
            this.exists = false;
            this.comment = true;
            this.vote = true;
            this.discordId = "162333087621971979";
        }
    }
    public async updatePreference(comment: boolean, vote: boolean) {
        this.comment = comment;
        this.vote = vote;
        const existingUser = await this.fetchUserByID(this.id);
        if (existingUser) {
            await prepare("run", "UPDATE notifyUser SET comment = ?, vote = ? WHERE userId = ?", [comment, vote, this.id]);
        } else {
            await prepare("run", "INSERT INTO notifyUser (userId, discordId, instance, comment, vote) VALUES (?, ?, ?, ?, ?)", [this.id, this.discordId, this.instance.name, comment, vote]);
        }
        await this.update();
    }
    public checkPreference = async (type: notifyTypes) => this[type];
    public async notify (user: User, message: string, instance: StashInstance, client: Client) {
        Logger.info(`Notifying ${user.name} (${user.id})`);
        if (!this.discordId) return Logger.debug(`No discord id for user ${user.name} (${user.id})`);
        const discUser = await client.users.fetch(this.discordId);
        if (!discUser) return Logger.debug(`Could not find user with id ${this.discordId}`);
        // craft discord message
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${instance.name} - Notify`, iconURL: instance.avatar })
            .setDescription(message);
        await discUser.send({ embeds: [embed] });
    }
    public async notifyComment(edit: Edit, comments: Comment[], instance: StashInstance, client: Client) {
        if (comments.length == 0) return;
        // check if user is on notify list
        if (!this.comment) return Logger.debug(`User ${this.id} has comments disabled`);
        // add to notified list
        const notifyComments = [];
        for (const comment of comments) {
            // check if already notified
            const notified = await prepare("all", "SELECT * FROM notifiedComments WHERE commentId = ?", [comment.id]);
            if (notified.length) continue;
            // add to notification list
            await prepare("run", "INSERT INTO notifiedComments (commentId) VALUES (?)", [comment.id]);
            notifyComments.push(comment);
        }
        // skip notifying if all notified
        if (!notifyComments.length) return;
        const url = `${instance.baseurl}/edits/${edit.id}`;
        await this.notify(edit.user, `You have ${notifyComments.length} new comment${notifyComments.length == 1 ? "" : "s"} on your [edit](${url})`, instance, client);
    }
    public async notifyVote(Edit: Edit, Vote: Vote, instance: StashInstance, client: Client) {
        // check if user is on notify list
        if (!this.vote) return Logger.debug(`User ${this.id} has votes disabled`);
        // check if already notified
        const notified = await prepare("get", "SELECT * FROM notifiedVotes WHERE editId = ? AND userId = ? AND date = ?", [Edit.id, Vote.user.id, Edit.updated]);
        if (notified) return;
        // add to notified list
        await prepare("run", "INSERT INTO notifiedVotes (editId, userId, date) VALUES (?, ?, ?)", [Edit.id, Vote.user.id, Edit.updated]);
        const url = `${instance.baseurl}/edits/${Edit.id}`;
        await this.notify(Vote.user, `[edit](${url}) has been edited since you last voted on it`, instance, client);
    }
}