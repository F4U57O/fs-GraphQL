import { gql } from "@apollo/client";

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    author {
      name
    }
    genres
  }
`;

export const ALL_BOOKS = gql`
  query {
    allBooks {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;
