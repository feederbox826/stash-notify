import { gql } from "graphql-request";

export const EditsQuery = gql`
query EditsQuery ($page: Int!, $per_page: Int!) {
  queryEdits(input: { status: PENDING, page: $page, per_page: $per_page }) {
    count
    edits {
      comments {
        id
        date
        user {
          id
        }
      }
      updated
      id
      created
      user {
        id
        name
      }
      votes {
        date
        vote
        user {
          id
          name
        }
      }
    }
  }
}
`;

export const EditCountQuery = gql`
query EditCountQuery {
  queryEdits(input: { status: PENDING }) {
    count
  }
}
`;

export const IDFromUsernameQuery = gql`
query IDFromUsernameQuery($username: String!) {
  findUser(username: $username) {
    id
    name
  }
}
`;