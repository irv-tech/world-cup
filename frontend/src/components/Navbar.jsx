import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";


function Navbar() {
  const navigate =
    useNavigate();

  const [
    username,
    setUsername,
  ] = useState(
    localStorage.getItem(
      "username"
    )
  );


  useEffect(() => {
    function handleAuthChange() {
      setUsername(
        localStorage.getItem(
          "username"
        )
      );
    }

    window.addEventListener(
      "storage",
      handleAuthChange
    );

    window.addEventListener(
      "authChange",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleAuthChange
      );

      window.removeEventListener(
        "authChange",
        handleAuthChange
      );
    };
  }, []);


  function handleLogout() {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "username"
    );

    setUsername(null);

    window.dispatchEvent(
      new Event(
        "authChange"
      )
    );

    navigate("/");
  }


  function getNavLinkClass({
    isActive,
  }) {
    return isActive
      ? "nav-link active"
      : "nav-link";
  }


  return (
    <nav className="main-navbar">
      <div className="nav-left">
        <NavLink
          to="/"
          className="nav-brand"
        >
          World Cup Platform
        </NavLink>


        <NavLink
          to="/"
          className={getNavLinkClass}
        >
          Home
        </NavLink>


        <NavLink
          to="/world-cup-2026"
          className={getNavLinkClass}
        >
          World Cup 2026
        </NavLink>


        <NavLink
          to="/teams"
          className={getNavLinkClass}
        >
          Teams
        </NavLink>


        <NavLink
          to="/history"
          className={getNavLinkClass}
        >
          History
        </NavLink>


        <NavLink
          to="/stats"
          className={getNavLinkClass}
        >
          Stats
        </NavLink>
      </div>


      <div className="nav-right">
        {username ? (
          <>
            <NavLink
              to="/my-world-cup"
              className={
                getNavLinkClass
              }
            >
              My World Cup
            </NavLink>


            <button
              type="button"
              className="nav-logout-button"
              onClick={
                handleLogout
              }
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={
                getNavLinkClass
              }
            >
              Login
            </NavLink>


            <NavLink
              to="/register"
              className="nav-register-button"
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}


export default Navbar;