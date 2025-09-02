import { useLoaderData } from "react-router";
import { getAllCategories, getAllProgressEntriesWithAudit, getAllUsers, getSummaryUsers } from "~/models/game.server";
import { requireAdmin } from "~/utils/session.server";

export async function loader({ request }: { request: Request }) {
  // Require admin privileges
  await requireAdmin(request);

  const users = getAllUsers();
  const categories = getAllCategories();
  const leaderboard = getSummaryUsers();
  const auditLog = getAllProgressEntriesWithAudit();

  return { users, categories, leaderboard, auditLog };
}

export default function Admin() {
  const { users, categories, leaderboard, auditLog } = useLoaderData<typeof loader>();

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", marginBottom: "8rem" }}>
      <h1>🎮 Game Tracker Admin</h1>

      <div style={{ marginBottom: "30px" }}>
        <a
          href="/admin/users"
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "10px 20px",
            textDecoration: "none",
            borderRadius: "5px",
            display: "inline-block",
            marginRight: "10px"
          }}
        >
          👥 Manage Users
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "30px" }}>

        {/* Users Management */}
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h2>👥 Users ({users.length})</h2>

          <div style={{ marginBottom: "20px" }}>
            <a
              href="/admin/create-player"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px 20px",
                textDecoration: "none",
                borderRadius: "5px",
                display: "inline-block"
              }}
            >
              + Add New User
            </a>
          </div>

          {users.length > 0 ? (
            <div>
              {users.map(user => (
                <div key={user.id} style={{
                  border: "1px solid #eee",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between"
                }}>
                  <span>{user.name} ({user.role})</span>
                  <div>
                    <a
                      href={`/player/${user.name}`}
                      style={{ marginRight: "10px", color: "#007bff" }}
                    >
                      View Profile
                    </a>
                    <a
                      href={`/admin/setup/${user.name}`}
                      style={{ color: "#007bff" }}
                    >
                      Setup
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666" }}>No users yet.</p>
          )}
        </div>

        {/* Categories */}
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h2>📊 Categories ({categories.length})</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {categories.map(category => (
              <li key={category.id} style={{
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>{category.name}</span>
                <span style={{ color: "#666", fontSize: "12px" }}>({category.unit})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Audit Log */}
      <div style={{ marginTop: "40px", border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
        <h2>📋 Recent Activity (Audit Log)</h2>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {auditLog.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Player</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Category</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Amount</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Added By</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.slice(0, 50).map(entry => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px", fontSize: "12px" }}>
                      {new Date(entry.recorded_at).toLocaleString()}
                    </td>
                    <td style={{ padding: "8px" }}>{entry.user_name}</td>
                    <td style={{ padding: "8px" }}>{entry.category_name}</td>
                    <td style={{ padding: "8px", fontWeight: entry.amount > 0 ? "normal" : "bold", color: entry.amount > 0 ? "green" : "red" }}>
                      {entry.amount > 0 ? "+" : ""}{entry.amount}
                    </td>
                    <td style={{ padding: "8px", color: "#666" }}>
                      {entry.added_by_username || "System"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: "#666" }}>No activity yet.</p>
          )}
        </div>
      </div>

      {/* Leaderboard Preview */}
      {leaderboard.length > 0 && (
        <div style={{ marginTop: "40px", border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h2>🏆 Current Leaderboard</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {leaderboard.map((entry, index) => (
              <div key={entry.name} style={{
                backgroundColor: index === 0 ? "#fff3cd" : "#f8f9fa",
                border: index === 0 ? "2px solid #ffc107" : "1px solid #dee2e6",
                padding: "15px",
                borderRadius: "5px",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {index === 0 ? "👑" : `#${index + 1}`} {entry.name}
                </div>
                <div style={{ fontSize: "24px", color: "#007bff", fontWeight: "bold" }}>
                  {entry.completion_score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <a href="/" style={{ color: "#666" }}>← Back to Home</a>
      </div>
    </div>
  );
}
