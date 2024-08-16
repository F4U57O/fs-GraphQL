import { gql, useQuery } from "@apollo/client";
import { useState } from "react";

const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      published
      author {
        name
      }
      genres
    }
  }
`;

const ALL_GENRES = gql`
  query {
    allGenres
  }
`;

const Books = (props) => {
  const [genreFilter, setGenreFilter] = useState("");
  const { loading, data, error } = useQuery(ALL_BOOKS, {
    variables: { genre: genreFilter },
    pollInterval: 2000,
  });

  const { loading: genresLoading, data: genresData } = useQuery(ALL_GENRES, {
    pollInterval: 2000,
  });

  if (!props.show) {
    return null;
  }
  if (loading || genresLoading) {
    return <div>loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const allGenres = genresData.allGenres;

  return (
    <div>
      <h2>books</h2>
      <div>
        <label>Filter by genre:</label>
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="">All genres</option>
          {allGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks.map((book) => (
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

export default Books;
