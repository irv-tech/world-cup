import { useState } from "react";
import { loginUser } from "../services/authApi";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    try {
      const data = await loginUser(username, password);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.user.username);

      setMessage(`Logged in as ${data.user.username}`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="page-container">
      <h1>Login</h1>

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;