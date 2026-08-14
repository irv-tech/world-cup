import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [username, setUsername] = useState(
    localStorage.getItem("username")
  );

  useEffect(() => {
    function handleStorageChange() {
      setUsername(localStorage.getItem("username"));
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "authChange",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "authChange",
        handleStorageChange
      );
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setUsername(null);

    window.dispatchEvent(
      new Event("authChange")
    );
  }

  return (
    <nav>
      <Link to="/">Home</Link>

      <Link to="/world-cup-2026">
        World Cup 2026
      </Link>

      <Link to="/teams">Teams</Link>

      <Link to="/matches">Matches</Link>

      <Link to="/history">History</Link>

      <Link to="/stats">Stats</Link>

      {username ? (
        <>
          <span className="nav-user">
            Logged in as {username}
          </span>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <button onClick={handleLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>

          <Link to="/register">
            Register
          </Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;