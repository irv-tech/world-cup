import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Matches from "./pages/Matches";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeamDetails from "./pages/TeamDetails";
import Dashboard from "./pages/MyWorldCup";
import TournamentHistory from "./pages/TournamentHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import WorldCup2026 from "./pages/WorldCup2026";
import Stats from "./pages/Stats";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/world-cup-2026"
          element={<WorldCup2026 />}
        />

        <Route
          path="/teams"
          element={<Teams />}
        />

        <Route
          path="/teams/:id"
          element={<TeamDetails />}
        />

        <Route
          path="/players"
          element={<Players />}
        />

        <Route
          path="/matches"
          element={<Matches />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/history/:year"
          element={<TournamentHistory />}
        />

        <Route
          path="/stats"
          element={<Stats />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/my-world-cup"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}


export default App;