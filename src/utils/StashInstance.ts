// imports
// modules
import { GraphQLClient } from "graphql-request";
import * as gql from "./gql";
// types
interface StashConfigSanitized {
    name: string;
    baseurl: string;
}
export interface StashConfig extends StashConfigSanitized {
    gql_endpoint: string;
    apikey: string;
    avatar: string;
}
// class
export class StashInstance {
    // properties
    public name: string;
    public baseurl: string;
    public avatar: string;
    private gql_endpoint: string;
    private apikey: string;
    private client: GraphQLClient;
    // constructor
    constructor(instance: StashConfig) {
        this.name = instance.name;
        this.baseurl = instance.baseurl;
        this.gql_endpoint = instance.gql_endpoint ?? "/graphql";
        this.apikey = instance.apikey;
        this.avatar = instance.avatar;
        this.client = new GraphQLClient(`${this.baseurl}${this.gql_endpoint}`, {
            method: "GET",
            headers: {
              "ApiKey": this.apikey,
              "User-Agent": "feederbox826/stash-notify"
            },
        });
    }
    // properties
    // GQL functions
    getCount = async () => gql.getCount(this.client);
    getEdits = async (page: number = 1, per_page: number = 100) => gql.getEdits(this.client, page, per_page);
    getAllEdits = async () => {
        const per_page = 100;
        const count = await this.getCount();
        const totalPages = Math.ceil(count / per_page);
        const edits = [];
        for (let page = 1; page <= totalPages; page++) {
            const result = await this.getEdits(page, per_page);
            edits.push(...result);
        }
        return edits;
    };
    getUserID = async (username: string) => gql.getUserID(this.client, username);
}