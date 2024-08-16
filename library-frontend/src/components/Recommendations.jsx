import React from "react";
import { gql, useQuery } from "@apollo/client";

const FAVORITE_GENRE = gql`
  query {
    me {
      favoriteGenre
    }
  }
`;

const BOOKS_BY_GENRE = gql`
  query booksByGenre($genre: String!) {
    booksByGenre(genre: $genre) {
      title
      published
      author {
        name
      }
      genres
    }
  }
`;

const Recommendations = (props) => {
  const favoriteResult = useQuery(FAVORITE_GENRE);
  const favoriteGenre = favoriteResult.data?.me?.favoriteGenre;
  const bookResult = useQuery(BOOKS_BY_GENRE, {
    pollInterval: 2000,
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre,
  });

  if (!props.show) {
    return null;
  }
  if (favoriteResult.loading || bookResult.loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        Books in your favorite genre: <strong>{favoriteGenre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {bookResult.data?.booksByGenre.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
