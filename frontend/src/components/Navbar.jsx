import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link> | 
      <Link to="/teams">Teams</Link> | 
      <Link to="/players">Players</Link> | 
      <Link to="/matches">Matches</Link> | 
      <Link to="/history">History</Link> | 
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
}

export default Navbar;                                  