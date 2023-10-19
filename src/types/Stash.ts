export interface User {
    id: string;
    name: string;
}
export interface Comment {
    id: string;
    date: string;
    user: User;
}
export interface Vote {
    date: string;
    vote: voteType;
    user: User;
}
export interface Edit {
    comments: Comment[];
    created: string;
    updated: string;
    id: string;
    user: User;
    votes: Vote[];
}
export interface QueryEdits {
    "queryEdits": {
        "count": number;
        "edits": Edit[];
    }
}
export interface QueryCount {
    "queryEdits": {
        "count": number;
    }
}
export interface QueryUser {
    "findUser": User | null
}
export enum voteType {
    ACCEPT = "ACCEPT",
    REJECT = "REJECT",
    ABSTAIN = "ABSTAIN"
}