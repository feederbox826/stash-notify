import { Client } from "discord.js";
import { Edit, voteType } from "../types/Stash";
import { NotifyUser } from "./NotifyUser";
import { StashInstance } from "./StashInstance";
// logger

export function filterEdits(Edits: Edit[], instance: StashInstance, client: Client) {
    for (const Edit of Edits) {
        filterEdit(Edit, instance, client);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isEditBlocked(Edit: Edit): boolean {
    const rejects = Edit.votes.filter((vote) => vote.vote == voteType.REJECT);
    const accepts = Edit.votes.filter((vote) => vote.vote == voteType.ACCEPT);
    return (accepts.length > rejects.length);
}

function filterEdit(Edit: Edit, instance: StashInstance, client: Client): void {
    const editDate = Date.parse(Edit.updated);
    // notify on comments
    const notifyComments = Edit.comments
        // only comments from other users
        .filter((comment) => comment.user.id != Edit.user.id)
        // only include comments with a date greater than the last edit
        .filter((comment) => Date.parse(comment.date) > editDate);
    const editUser = new NotifyUser(Edit.user.id);
    editUser.notifyComment(Edit, notifyComments, instance, client);
    // notify on votes
    const notifyVotes = Edit.votes
        .filter((vote) => vote.vote == voteType.REJECT)
        .filter((vote) => Date.parse(vote.date) < editDate);
    for (const vote of notifyVotes) {
        // if (isEditBlocked(Edit));
        const voteUser = new NotifyUser(vote.user.id);
        voteUser.notifyVote(Edit, vote, instance, client);
    }
}