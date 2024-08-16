import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";

const CREATE_USER = gql`
  mutation createUser($username: String!, $favoriteGenre: String!) {
    createUser(username: $username, favoriteGenre: $favoriteGenre) {
      username
      favoriteGenre
    }
  }
`;

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [favoriteGenre, setFavoriteGenre] = useState("");
  const [createUser] = useMutation(CREATE_USER);

  const submit = async (event) => {
    event.preventDefault();

    try {
      await createUser({ variables: { username, favoriteGenre } });
      setUsername("");
      setFavoriteGenre("");
    } catch (error) {
      console.error("Creating user failed");
    }
  };

  return (
    <form onSubmit={submit}>
      <div>
        Username
        <input
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        Favorite Genre
        <input
          value={favoriteGenre}
          onChange={({ target }) => setFavoriteGenre(target.value)}
        />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUpForm;
