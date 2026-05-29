function Dashboard() {
  const username = localStorage.getItem("username");

  return (
    <div className="page-container">
      <h1>User Dashboard</h1>

      <p>Welcome, {username}.</p>

      <div className="card">
        <h2>Account Features Coming Soon</h2>
        <p>Favorite teams, saved players, and match reminders will appear here.</p>
      </div>
    </div>
  );
}

export default Dashboard;