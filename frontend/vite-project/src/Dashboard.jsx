import React, { useState } from "react";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [followers, setFollowers] = useState("");
  const [following, setFollowing] = useState("");

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Fake Finder</h1>

      <div style={{ marginTop: "2rem" }}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginLeft: "1rem" }}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Followers:</label>
        <input
          type="number"
          value={followers}
          onChange={(e) => setFollowers(e.target.value)}
          style={{ marginLeft: "1rem" }}
        />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label>Following:</label>
        <input
          type="number"
          value={following}
          onChange={(e) => setFollowing(e.target.value)}
          style={{ marginLeft: "1rem" }}
        />
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Dashboard Info:</h3>
        <p>Username: {username}</p>
        <p>Followers: {followers}</p>
        <p>Following: {following}</p>
      </div>
    </div>
  );
}
