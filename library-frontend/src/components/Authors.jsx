import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import Select from "react-select";
import Notify from "./Notify";

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`;

const Authors = (props) => {
  const [selectAuthor, setSelectAuthor] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [born, setBorn] = useState("");
  const [updateAuthor] = useMutation(UPDATE_AUTHOR);
  const result = useQuery(ALL_AUTHORS, {
    pollInterval: 2000,
  });
  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  if (result.error) {
    return <div>Error: {result.error.message}</div>;
  }

  if (!result.data || !result.data.allAuthors) {
    return <div>No authors found</div>;
  }

  const submit = async (event) => {
    event.preventDefault();

    try {
      await updateAuthor({
        variables: { name: selectAuthor.value, setBornTo: parseInt(born) },
      });
      setSelectAuthor(null);
      setBorn("");
    } catch (error) {
      console.error("Update failed");
      setErrorMessage(error.message);
      setTimeout(() => {
        setErrorMessage(null);
      }, 10000);
    }
  };

  const select = result.data.allAuthors.map((a) => ({
    value: a.name,
    label: a.name,
  }));

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h3>Set birthyear</h3>
      </div>
      <form onSubmit={submit}>
        <div>
          <Select
            value={selectAuthor}
            onChange={setSelectAuthor}
            options={select}
            placeholder="Select author"
          />
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
