import { User, Comment, Edit, Vote } from "../types/Stash";
import { prepare } from "./db";
import Logger from "./logger";
import { StashInstance } from "./StashInstance";
import { config } from "./config";
import axios from "axios";

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
        this.fetchUserByID(this.id).then(dbUser => {
            if (dbUser) {
                this.exists = true;
                this.comment = Boolean(dbUser.comment);
                this.vote = Boolean(dbUser.vote);
                this.discordId = dbUser.discordId;
            }
        });
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
    public async save () {
        if (this.exists) {
            await prepare("run", "UPDATE notifyUser SET comment = ?, vote = ? WHERE userId = ?", [this.comment, this.vote, this.id]);
        } else {
            await prepare("run", "INSERT INTO notifyUser (userId, discordId, instance, comment, vote) VALUES (?, ?, ?, ?, ?)", [this.id, this.discordId, this.instance, this.comment, this.vote]);
        }
    }
    public async modifyPreference(type: notifyTypes, value: boolean) {
        this[type] = value;
        await this.save();
    }
    public checkPreference = async (type: notifyTypes) => this[type];
    public async notify (user: User, message: string, instance: StashInstance) {
        Logger.info(`Notifying ${user.name} (${user.id})`);
        // post to discord
        if (config.testMode) return Logger.debug("Test mode - not posting to discord");
        axios({
            method: "POST",
            url: config.discord.webhook,
            data: {
                username: `${instance.name}-Notify`,
                avatar_url: `${instance.avatar}`,
                content: `<@${this?.discordId}>: ${message}`,
            }
        });
    }
    public async notifyComment(edit: Edit, comments: Comment[], instance: StashInstance) {
        if (comments.length == 0) return;
        // check if user is on notify list
        //if (!this.comment) return;
        // add to notified list
        const notifyComments = [];
        for (const comment of comments) {
            // check if already notified
            const notified = await prepare("all", "SELECT * FROM notifiedComments WHERE commentId = ?", [comment.id]);
            if (notified) continue;
            // add to notification list
            await prepare("run", "INSERT INTO notifiedComments (commentId) VALUES (?)", [comment.id]);
            notifyComments.push(comment);
        }
        // skip notifying if all notified
        if (!notifyComments.length) return;
        const url = `${instance.baseurl}/edits/${edit.id}`;
        await this.notify(edit.user, `You have ${notifyComments.length} new comment${notifyComments.length == 1 ? "" : "s"} on your [edit](${url})`, instance);
    }
    public async notifyVote(Edit: Edit, Vote: Vote, instance: StashInstance) {
        // check if user is on notify list
        //if (!this.vote) return;
        // check if already notified
        const notified = await prepare("get", "SELECT * FROM notifiedVotes WHERE editId = ? AND userId = ? AND date = ?", [Edit.id, Vote.user.id, Edit.updated]);
        if (notified) return;
        // add to notified list
        await prepare("run", "INSERT INTO notifiedVotes (editId, userId, date) VALUES (?, ?, ?)", [Edit.id, Vote.user.id, Edit.updated]);
        const url = `${instance.baseurl}/edits/${Edit.id}`;
        await this.notify(Vote.user, `[edit](${url}) has been edited since you last voted on it`, instance);
    }
}