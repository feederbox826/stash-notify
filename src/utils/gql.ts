// modules
import { GraphQLClient } from "graphql-request";
import { EditsQuery, EditCountQuery, IDFromUsernameQuery } from "./gql_queries";
// types
import { QueryEdits, QueryCount, QueryUser, Edit } from "../types/Stash";

export async function getCount(client: GraphQLClient): Promise<number> {
    const data = await client.request(EditCountQuery) as QueryCount;
    return data.queryEdits.count;
}
export async function getEdits(client: GraphQLClient, page: number = 1, per_page: number = 100): Promise<Edit[]> {
    const data = await client.request(EditsQuery, { page, per_page }) as QueryEdits;
    return data.queryEdits.edits;
}
export async function getUserID(client: GraphQLClient, username: string): Promise<string | null> {
    const data = (await client.request(IDFromUsernameQuery, { username })) as QueryUser;
    return data.findUser?.id ?? null;
}