import { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const NEW_BOOK = gql`
  mutation addBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String]
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      published
      author {
        name
      }
      genres
      id
    }
  }
`;

const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      published
      author {
        name
      }
      genres
    }
  }
`;

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [addBook] = useMutation(NEW_BOOK, {
    onError: (error) => {
      console.error("Error adding book:", error.graphQLErrors[0]);
    },
    update: (cache, { data: { addBook } }) => {
      const data = cache.readQuery({ query: ALL_BOOKS });
      cache.writeQuery({
        query: ALL_BOOKS,
        data: {
          allBooks: [...data.allBooks, addBook],
        },
      });
    },
  });

  if (!props.show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    try {
      await addBook({
        variables: {
          title,
          published: parseInt(published),
          author,
          genres,
        },
      });

      console.log("add book...");

      setTitle("");
      setPublished("");
      setAuthor("");
      setGenres([]);
      setGenre("");
    } catch (error) {
      console.error("Error submitting:", error.message);
    }
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
