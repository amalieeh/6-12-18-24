import { useLoaderData } from "react-router";
import { getAllCategories, getAllPlayers, getSummaryPlayers } from "~/models/game.server";
import type { Route } from "./+types/admin";

export async function loader({ request }: Route.LoaderArgs) {
  const players = getAllPlayers();
  const categories = getAllCategories();
  const leaderboard = getSummaryPlayers();
  
  return { players, categories, leaderboard };
}

export default function Admin() {
  const { players, categories, leaderboard } = useLoaderData<typeof loader>();
  
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🎮 Game Tracker Admin</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "30px" }}>
        
        {/* Players Management */}
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h2>👥 Players ({players.length})</h2>
          
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
              + Add New Player
            </a>
          </div>
          
          {players.length > 0 ? (
            <div>
              {players.map(player => (
                <div key={player.id} style={{ 
                  border: "1px solid #eee", 
                  padding: "10px", 
                  marginBottom: "10px", 
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <strong>{player.name}</strong>
                    <br />
                    <small>Created: {new Date(player.created_at).toLocaleDateString()}</small>
                  </div>
                  <div>
                    <a 
                      href={`/admin/setup/${player.name}`}
                      style={{ 
                        backgroundColor: "#28a745", 
                        color: "white", 
                        padding: "5px 10px", 
                        textDecoration: "none", 
                        borderRadius: "3px",
                        fontSize: "12px",
                        marginRight: "5px"
                      }}
                    >
                      Setup Game
                    </a>
                    <a 
                      href={`/player/${player.name}`}
                      style={{ 
                        backgroundColor: "#17a2b8", 
                        color: "white", 
                        padding: "5px 10px", 
                        textDecoration: "none", 
                        borderRadius: "3px",
                        fontSize: "12px"
                      }}
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#666" }}>No players yet. Create one to get started!</p>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ border: "1px solid #ddd", padding: "20px", borderRadius: "8px" }}>
          <h2>⚡ Quick Actions</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a 
              href="/admin/add-progress"
              style={{
                backgroundColor: "#ffc107",
                color: "#212529",
                padding: "15px",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center",
                fontWeight: "bold"
              }}
            >
              📈 Add Progress for Player
            </a>
            
            <a 
              href="/dashboard"
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                padding: "15px",
                textDecoration: "none",
                borderRadius: "5px",
                textAlign: "center"
              }}
            >
              📊 View Full Dashboard
            </a>
          </div>

          <h3 style={{ marginTop: "30px" }}>📋 Game Categories</h3>
          <ul style={{ listStyle: "none", padding: "0" }}>
            {categories.map(category => (
              <li key={category.id} style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "8px", 
                marginBottom: "5px", 
                borderRadius: "3px",
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