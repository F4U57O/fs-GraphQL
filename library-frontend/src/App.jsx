import { useQuery, useApolloClient, useSubscription } from "@apollo/client";
import { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import LoginForm from "./components/LoginForm";
import SignUpForm from "./components/SignUpForm";
import Notify from "./components/Notify";
import Recommendations from "./components/Recommendations";
import { BOOK_ADDED, ALL_BOOKS } from "./queries";

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.title;
      return seen.has(k) ? false : seen.add(k);
    });
  };
  cache.updateQuery(query, (data) => {
    if (!data || !data.allBooks) {
      return {
        allBooks: [addedBook],
      };
    }
    return {
      allBooks: uniqByName(data.allBooks.concat(addedBook)),
    };
  });
};

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const client = useApolloClient();

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    window.location.reload();
  };

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded;
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
      notify(`${addedBook.title} by ${addedBook.author.name} added`);
      console.log(data);
    },
  });

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && (
          <button onClick={() => setPage("recommendations")}>
            recommendations
          </button>
        )}
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={logout}>logout</button>}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      {token && <NewBook show={page === "add"} />}

      {token && <Recommendations show={page === "recommendations"} />}

      {!token && (
        <div>
          <h2>Login</h2>
          <LoginForm setToken={setToken} setError={notify} />
          <h2>Sign Up</h2>
          <SignUpForm />
        </div>
      )}
    </div>
  );
};

export default App;
